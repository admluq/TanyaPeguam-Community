import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import {
  scoreConcreteScore,
  determineUrgency,
  suggestConversionTier,
  shouldDeflect,
  detectSophistication,
  buildInquirySummary,
} from '@/lib/donna';
import { sendInquiryEmail } from '@/lib/email';

const TIER_LABELS: Record<string, string> = {
  LOW: 'Konsultasi Percuma',
  MED: 'Konsultasi Berbayar',
  HIGH: 'Penahanan Penuh',
};

/**
 * POST /api/admin/donna-inquiry
 * Called by Donna Widget at end of intake session.
 * Flow: score → check deflect → save → email lawyer → return inquiry id
 *
 * Body:
 *   profileId      string   — target lawyer profile
 *   clientName     string?
 *   clientEmail    string?
 *   clientPhone    string?
 *   practiceArea   string?
 *   issueSummary   string   — distilled issue text for scoring
 *   transcript     string?  — full conversation log
 *   bridgeId       string?  — optional linked bridge session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profileId,
      clientName,
      clientEmail,
      clientPhone,
      practiceArea,
      issueSummary,
      transcript,
      bridgeId,
    } = body;

    if (!profileId || !issueSummary) {
      return NextResponse.json(
        { error: 'profileId and issueSummary are required' },
        { status: 400 }
      );
    }

    // Fetch profile + donnaConfig + lawyer email
    const profile = await db.lawyerProfile.findUnique({
      where: { id: profileId },
      include: {
        user: { select: { email: true, name: true } },
        donnaConfig: { select: { triageRules: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // ── Scoring ──────────────────────────────────────────────
    const isBridge = !!bridgeId;
    const rawScore = scoreConcreteScore(issueSummary, isBridge);
    const concreteScore = rawScore * 10; // normalize to 0–100
    const urgencyTag = determineUrgency(issueSummary);
    const sophistication = detectSophistication(issueSummary);
    const suggestedTier = suggestConversionTier(rawScore, urgencyTag);

    // ── Deflect check ────────────────────────────────────────
    const triageRules = profile.donnaConfig?.triageRules as
      | { deflectPatterns?: string[] }
      | null;
    const deflectPatterns = triageRules?.deflectPatterns ?? [];
    const deflected = shouldDeflect(issueSummary, deflectPatterns);

    // ── Persist inquiry ──────────────────────────────────────
    const inquiry = await db.donnaInquiry.create({
      data: {
        profileId,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        practiceArea: practiceArea || null,
        issueSummary,
        transcript: transcript || null,
        concreteScore,
        urgencyTag,
        sophistication,
        suggestedTier,
        deflected,
        status: deflected ? 'DEFLECTED' : 'PENDING',
        bridgeId: bridgeId || null,
      },
    });

    // ── Email notification (skip if deflected) ───────────────
    if (!deflected && profile.user.email) {
      const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
      const acceptUrl = `${baseUrl}/api/donna-respond?token=${inquiry.acceptToken}&action=accept`;
      const rejectUrl = `${baseUrl}/api/donna-respond?token=${inquiry.rejectToken}&action=reject`;

      const summary = buildInquirySummary(
        clientName,
        clientPhone,
        practiceArea,
        issueSummary,
        rawScore,
        urgencyTag
      );

      try {
        await sendInquiryEmail({
          to: profile.user.email,
          lawyerName: profile.user.name ?? profile.firmName ?? 'Peguam',
          callerName: clientName || null,
          callerPhone: clientPhone || null,
          callerEmail: clientEmail || null,
          practiceArea: practiceArea || null,
          issueSummary: summary,
          concreteScore: rawScore,
          urgencyTag,
          conversionTier: suggestedTier,
          tierLabel: TIER_LABELS[suggestedTier] ?? suggestedTier,
          acceptUrl,
          rejectUrl,
        });

        // Mark as EMAILED
        await db.donnaInquiry.update({
          where: { id: inquiry.id },
          data: { status: 'EMAILED', emailSentAt: new Date() },
        });
      } catch (emailError) {
        // Non-fatal: inquiry saved, email failed — log and continue
        console.error('Email send failed:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      inquiryId: inquiry.id,
      deflected,
      urgencyTag,
      suggestedTier,
    });
  } catch (error) {
    console.error('Donna inquiry POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/donna-inquiry
 * Returns the authenticated lawyer's inquiry lead inbox.
 * Supports ?status=PENDING|EMAILED|ACCEPTED|REJECTED|DEFLECTED
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the lawyer's profile
    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const inquiries = await db.donnaInquiry.findMany({
      where: {
        profileId: profile.id,
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        practiceArea: true,
        issueSummary: true,
        concreteScore: true,
        urgencyTag: true,
        sophistication: true,
        suggestedTier: true,
        deflected: true,
        status: true,
        emailSentAt: true,
        acceptedAt: true,
        rejectedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('Donna inquiry GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
