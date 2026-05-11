// app/api/public/donna-intake/route.ts
// PUBLIC endpoint — clients chat with Donna via the lawyer's slug
// Uses lib/bridge.ts chokepoint for all writes
// 5-question lean MVP → email on completion

import { db } from '@/lib/db';
import { createBridge, appendTurn, finalizeBridge } from '@/lib/bridge';
import {
  getNextQuestion,
  isIntakeComplete,
  formatIntakeForEmail,
  extractKeyInfo,
} from '@/lib/donna-simple';
import { sendSimpleIntakeSummary } from '@/lib/email-donna';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lawyerSlug, message, bridgeShortCode } = body as {
      lawyerSlug: string;
      message: string;
      bridgeShortCode?: string;
    };

    if (!lawyerSlug || !message) {
      return Response.json(
        { error: 'Missing lawyerSlug or message' },
        { status: 400 }
      );
    }

    // Find lawyer — INCLUDE user so we can read email later
    const profile = await db.lawyerProfile.findUnique({
      where: { slug: lawyerSlug },
      include: { user: true, donnaConfig: true, legalServiceConfig: true },
    });

    if (!profile) {
      return Response.json({ error: 'Lawyer not found' }, { status: 404 });
    }
    if (!profile.isPublic) {
      return Response.json(
        { error: 'Profile not accepting inquiries' },
        { status: 403 }
      );
    }
    if (!profile.donnaConfig) {
      return Response.json(
        { error: 'Donna AI not configured' },
        { status: 400 }
      );
    }

    // ── Get or create bridge (via chokepoint) ────────────────
    let bridge = bridgeShortCode
      ? await db.donnaBridge.findUnique({ where: { shortCode: bridgeShortCode } })
      : null;

    if (bridge && bridge.profileId !== profile.id) {
      return Response.json({ error: 'Invalid bridge code' }, { status: 400 });
    }

    if (!bridge) {
      // First message — the user's message is the initial question,
      // the next question from our script is the initial answer
      const firstQuestion = getNextQuestion(0);
      bridge = await createBridge({
        profileId: profile.id,
        initialQuestion: message,
        initialAnswer: firstQuestion,
        createdBy: 'inbound',
      });

      // First turn is already stored via createBridge's initial Q/A.
      // Append both sides to chatTranscript for consistency.
      await appendTurn(bridge.id, {
        role: 'user',
        content: message,
        turnIndex: 0,
      });
      await appendTurn(bridge.id, {
        role: 'assistant',
        content: firstQuestion,
        turnIndex: 0,
      });

      return Response.json({
        success: true,
        bridgeShortCode: bridge.shortCode,
        bridgeId: bridge.id,
        message: firstQuestion,
        turnCount: 1,
        intakeComplete: false,
      });
    }

    // ── Continuing session ──────────────────────────────────
    const transcript = (bridge.chatTranscript as unknown as Array<{
      role: string;
      content: string;
    }>) ?? [];
    const turnCount = transcript.filter((m) => m.role === 'user').length;

    const nextQuestion = getNextQuestion(turnCount);

    // Append via chokepoint (idempotent)
    await appendTurn(bridge.id, {
      role: 'user',
      content: message,
      turnIndex: turnCount,
    });
    await appendTurn(bridge.id, {
      role: 'assistant',
      content: nextQuestion,
      turnIndex: turnCount,
    });

    const intakeComplete = isIntakeComplete(turnCount + 1);

    // ── On completion: summarise + email ─────────────────────
    if (intakeComplete) {
      // Re-read full transcript after appends
      const finalBridge = await db.donnaBridge.findUnique({
        where: { id: bridge.id },
      });
      const fullTranscript = (finalBridge?.chatTranscript as unknown as Array<{
        role: string;
        content: string;
      }>) ?? [];

      const formattedTranscript = formatIntakeForEmail(fullTranscript);
      const { issue } = extractKeyInfo(fullTranscript);

      // Finalize bridge (sets COMPLETED + summary)
      await finalizeBridge(bridge.id, {
        summary: formattedTranscript,
        triageResult: { status: 'PENDING_REVIEW', questionCount: turnCount + 1 },
      });

      // Send email to lawyer
      await sendSimpleIntakeSummary({
        lawyerEmail: profile.user.email,
        lawyerName: profile.username || profile.user.name || 'Lawyer',
        firmName: profile.firmName || 'Law Firm',
        issue,
        transcript: formattedTranscript,
        bridgeShortCode: bridge.shortCode,
      });
    }

    return Response.json({
      success: true,
      bridgeShortCode: bridge.shortCode,
      bridgeId: bridge.id,
      message: nextQuestion,
      turnCount: turnCount + 1,
      intakeComplete,
    });
  } catch (error) {
    console.error('Public donna-intake error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('shortCode');

    if (!shortCode) {
      return Response.json({ error: 'Missing shortCode' }, { status: 400 });
    }

    const bridge = await db.donnaBridge.findUnique({
      where: { shortCode },
      include: { profile: { select: { isPublic: true, username: true, firmName: true } } },
    });

    if (!bridge || !bridge.profile.isPublic) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      shortCode: bridge.shortCode,
      status: bridge.status,
      lawyerName: bridge.profile.username,
      firmName: bridge.profile.firmName,
      transcript: bridge.chatTranscript ?? [],
      createdAt: bridge.createdAt,
    });
  } catch (error) {
    console.error('Public donna-intake GET error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
