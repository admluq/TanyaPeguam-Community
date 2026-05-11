import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { createInquiry } from '@/lib/inquiry';

/**
 * POST /api/admin/donna-inquiry
 * Called by Donna Widget at end of intake session.
 *
 * The actual scoring + persist + email logic lives in lib/inquiry.ts so
 * that other server-side code (notably /api/donna-chat) can call it
 * directly without an inter-route HTTP hop (audit SPOF #10/#11).
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

    const result = await createInquiry({
      profileId,
      clientName,
      clientEmail,
      clientPhone,
      practiceArea,
      issueSummary,
      transcript,
      bridgeId,
    });

    return NextResponse.json({
      success: true,
      inquiryId: result.inquiryId,
      deflected: result.deflected,
      urgencyTag: result.urgencyTag,
      suggestedTier: result.suggestedTier,
      emailSent: result.emailSent,
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
