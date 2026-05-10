import { db } from '@/lib/db';
import { sendInquiryEmail } from '@/lib/email';
import { generateTokens } from '@/lib/donna';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

type InquiryPayload = {
  userId: string;
  bridgeId?: string;
  callerName?: string;
  callerPhone?: string;
  callerEmail?: string;
  issueSummary: string;
  practiceArea?: string;
  concreteScore?: number;
  urgencyTag?: string;
  conversionTier?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as InquiryPayload;
    const { userId, bridgeId, callerName, callerPhone, callerEmail, issueSummary, practiceArea, concreteScore = 5, urgencyTag = 'STANDARD', conversionTier = 'MED' } = body;

    if (!userId || !issueSummary) {
      return NextResponse.json(
        { error: 'userId dan issueSummary diperlukan' },
        { status: 400 }
      );
    }

    // Get user and config
    const [user, config] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.donnaConfig.findUnique({ where: { userId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate magic link tokens
    const { acceptToken, rejectToken } = generateTokens();

    const inquiry = await db.donnaInquiry.create({
      data: {
        userId,
        bridgeId,
        callerName,
        callerPhone,
        callerEmail,
        issueSummary,
        practiceArea,
        concreteScore,
        urgencyTag,
        conversionTier,
        status: 'CAPTURED',
        acceptToken,
        rejectToken,
      },
    });

    // Send email to lawyer
    const emailTo = config?.emailTo ?? user.email;
    const tierLabel = getTierLabel(conversionTier, config);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';

    try {
      await sendInquiryEmail({
        to: emailTo,
        lawyerName: user.name ?? 'Peguam',
        callerName,
        callerPhone,
        callerEmail,
        practiceArea,
        issueSummary,
        concreteScore,
        urgencyTag,
        conversionTier,
        tierLabel,
        acceptUrl: `${baseUrl}/api/donna/respond?token=${acceptToken}&action=accept`,
        rejectUrl: `${baseUrl}/api/donna/respond?token=${rejectToken}&action=reject`,
      });

      await db.donnaInquiry.update({
        where: { id: inquiry.id },
        data: { emailSentAt: new Date(), status: 'EMAILED' },
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({
      id: inquiry.id,
      status: 'EMAILED',
      message: `Ringkasan pertanyaan telah dihantar ke ${emailTo}`,
    });
  } catch (error) {
    console.error('Inquiry POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function getTierLabel(tier: string, config: any): string {
  if (!config) {
    const defaults: Record<string, string> = {
      LOW: 'Konsultasi (RM50)',
      MED: 'Web Call',
      HIGH: 'Temujanji',
    };
    return defaults[tier] ?? tier;
  }

  if (tier === 'LOW') return config.lowTierLabel;
  if (tier === 'MED') return config.medTierLabel;
  if (tier === 'HIGH') return config.highTierLabel;
  return tier;
}
