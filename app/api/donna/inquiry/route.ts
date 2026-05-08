import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { scoreConcreness, detectUrgency, suggestTier, buildIssueSummary } from '@/lib/donna';
import { sendInquiryEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, bridgeId, callerName, callerPhone, callerEmail, practiceArea, responses } = body;

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const config = await db.donnaConfig.findUnique({ where: { userId } });
  const isBridge = !!bridgeId;

  const fullText = (responses ?? []).map((r: { answer: string }) => r.answer).join(' ');
  const concreteScore = scoreConcreness(fullText, isBridge);
  const urgencyTag = detectUrgency(fullText);
  const conversionTier = suggestTier(concreteScore, urgencyTag);

  const issueSummary = buildIssueSummary(practiceArea, callerName, responses ?? []);

  const acceptToken = nanoid(24);
  const rejectToken = nanoid(24);

  const inquiry = await db.donnaInquiry.create({
    data: {
      userId,
      bridgeId: bridgeId ?? null,
      callerName,
      callerPhone,
      callerEmail,
      practiceArea,
      issueSummary,
      concreteScore,
      urgencyTag,
      conversionTier,
      status: 'CAPTURED',
      acceptToken,
      rejectToken,
    },
  });

  // Send email summary
  const emailTo = config?.emailTo;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanyapeguam.com';

  if (emailTo) {
    try {
      const lawyer = await db.user.findUnique({
        where: { id: userId },
        select: { name: true, profile: { select: { name: true } } },
      });
      const lawyerName = lawyer?.profile?.name ?? lawyer?.name ?? 'Peguam';
      const tierLabel = conversionTier === 'LOW'
        ? (config?.lowTierLabel ?? 'Konsultasi (RM50)')
        : conversionTier === 'HIGH'
        ? (config?.highTierLabel ?? 'Temujanji')
        : (config?.medTierLabel ?? 'Web Call');

      await sendInquiryEmail({
        to: emailTo,
        lawyerName,
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
        data: { status: 'EMAILED', emailSentAt: new Date() },
      });
    } catch {
      // Email failure doesn't break the response
    }
  }

  // Build closing message for Donna widget
  const tierMessages: Record<string, string> = {
    LOW: config?.lowTierLabel ?? 'Konsultasi (RM50)',
    MED: config?.medTierLabel ?? 'Web Call',
    HIGH: config?.highTierLabel ?? 'Temujanji',
  };

  const closing = `Terima kasih, ${callerName ?? 'Encik/Cik'}. Maklumat anda telah dihantar. Berdasarkan situasi anda, saya cadangkan perkhidmatan **${tierMessages[conversionTier]}**. Peguam akan menghubungi anda dalam masa terdekat.`;

  return NextResponse.json({ success: true, closing, conversionTier, tierLabel: tierMessages[conversionTier] });
}
