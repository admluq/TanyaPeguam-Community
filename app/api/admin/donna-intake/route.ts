// app/api/admin/donna-intake/route.ts
// ADMIN endpoint — lawyer tests Donna intake from dashboard
// Uses lib/bridge.ts chokepoint for all writes
// 5-question lean MVP → email on completion

import { auth } from '@/auth';
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
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profileId, message, bridgeId } = body as {
      profileId: string;
      message: string;
      bridgeId?: string;
    };

    if (!profileId || !message) {
      return Response.json(
        { error: 'Missing profileId or message' },
        { status: 400 }
      );
    }

    // Verify profile ownership
    const profile = await db.lawyerProfile.findUnique({
      where: { id: profileId },
      include: { user: true, donnaConfig: true },
    });

    if (!profile || profile.user.id !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // ── Get or create bridge (via chokepoint) ────────────────
    let bridge = bridgeId
      ? await db.donnaBridge.findUnique({ where: { id: bridgeId } })
      : null;

    if (!bridge) {
      const firstQuestion = getNextQuestion(0);
      bridge = await createBridge({
        profileId,
        initialQuestion: message,
        initialAnswer: firstQuestion,
        createdBy: 'lawyer',
      });

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
        bridgeId: bridge.id,
        shortCode: bridge.shortCode,
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
      const finalBridge = await db.donnaBridge.findUnique({
        where: { id: bridge.id },
      });
      const fullTranscript = (finalBridge?.chatTranscript as unknown as Array<{
        role: string;
        content: string;
      }>) ?? [];

      const formattedTranscript = formatIntakeForEmail(fullTranscript);
      const { issue } = extractKeyInfo(fullTranscript);

      await finalizeBridge(bridge.id, {
        summary: formattedTranscript,
        triageResult: { status: 'PENDING_REVIEW', questionCount: turnCount + 1 },
      });

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
      bridgeId: bridge.id,
      shortCode: bridge.shortCode,
      message: nextQuestion,
      turnCount: turnCount + 1,
      intakeComplete,
    });
  } catch (error) {
    console.error('Admin donna-intake error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bridgeId = searchParams.get('bridgeId');

    if (!bridgeId) {
      return Response.json({ error: 'Missing bridgeId' }, { status: 400 });
    }

    const bridge = await db.donnaBridge.findUnique({
      where: { id: bridgeId },
      include: { profile: { include: { user: true } } },
    });

    if (!bridge || bridge.profile.user.id !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return Response.json({
      success: true,
      bridgeId: bridge.id,
      shortCode: bridge.shortCode,
      status: bridge.status,
      transcript: bridge.chatTranscript ?? [],
      summary: bridge.summary,
      clientName: bridge.clientName,
      clientEmail: bridge.clientEmail,
      practiceArea: bridge.practiceArea,
      createdAt: bridge.createdAt,
      updatedAt: bridge.updatedAt,
    });
  } catch (error) {
    console.error('Admin donna-intake GET error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
