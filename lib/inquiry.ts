/**
 * Inquiry helper — pure function that creates+scores+notifies an inquiry.
 *
 * Replaces the inter-route HTTP call that /api/donna-chat used to make to
 * /api/admin/donna-inquiry (SPOF #10/#11 in the audit). Both routes now
 * call this shared function directly — eliminates ECONNREFUSED in
 * serverless environments where NEXTAUTH_URL is unset.
 */

import { db } from './db';
import {
  scoreConcreteScore,
  determineUrgency,
  suggestConversionTier,
  shouldDeflect,
  detectSophistication,
  buildInquirySummary,
} from './donna';
import { sendInquiryEmail } from './email';

const TIER_LABELS: Record<string, string> = {
  LOW: 'Konsultasi Percuma',
  MED: 'Konsultasi Berbayar',
  HIGH: 'Penahanan Penuh',
};

export interface CreateInquiryInput {
  profileId: string;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  practiceArea?: string | null;
  issueSummary: string;
  transcript?: string | null;
  /** If set, links the inquiry back to its originating bridge session. */
  bridgeId?: string | null;
}

export interface CreateInquiryResult {
  inquiryId: string;
  deflected: boolean;
  urgencyTag: string;
  suggestedTier: string;
  emailSent: boolean;
}

export async function createInquiry(input: CreateInquiryInput): Promise<CreateInquiryResult> {
  if (!input.profileId) throw new Error('createInquiry: profileId required');
  if (!input.issueSummary) throw new Error('createInquiry: issueSummary required');

  // ── Fetch profile + configs (single round trip) ─────────
  const profile = await db.lawyerProfile.findUnique({
    where: { id: input.profileId },
    include: {
      user: { select: { email: true, name: true } },
      donnaConfig: { select: { triageRules: true } },
      legalServiceConfig: {
        select: {
          emelPertanyaan: true,
          tierPerkhidmatan: true,
        },
      },
    },
  });
  if (!profile) throw new Error(`createInquiry: profile ${input.profileId} not found`);

  const lsc = profile.legalServiceConfig;
  const allowedTiers = (lsc?.tierPerkhidmatan ?? []) as string[];
  const inquiryEmail = lsc?.emelPertanyaan || profile.user.email;

  // ── Scoring (Agent B equivalent — keyword-based, will be replaced) ─
  const isBridge = !!input.bridgeId;
  const rawScore = scoreConcreteScore(input.issueSummary, isBridge);
  const concreteScore = rawScore * 10; // 0–100
  const urgencyTag = determineUrgency(input.issueSummary);
  const sophistication = detectSophistication(input.issueSummary);
  const rawSuggestedTier = suggestConversionTier(rawScore, urgencyTag);

  const suggestedTier =
    allowedTiers.length > 0
      ? allowedTiers.includes(rawSuggestedTier)
        ? rawSuggestedTier
        : allowedTiers[allowedTiers.length - 1]
      : rawSuggestedTier;

  // ── Deflect check ───────────────────────────────────────
  const triageRules = profile.donnaConfig?.triageRules as
    | { deflectPatterns?: string[] }
    | null;
  const deflectPatterns = triageRules?.deflectPatterns ?? [];
  const deflected = shouldDeflect(input.issueSummary, deflectPatterns);

  // ── Persist inquiry ─────────────────────────────────────
  const inquiry = await db.donnaInquiry.create({
    data: {
      profileId: input.profileId,
      bridgeId: input.bridgeId ?? null,
      clientName: input.clientName ?? null,
      clientEmail: input.clientEmail ?? null,
      clientPhone: input.clientPhone ?? null,
      practiceArea: input.practiceArea ?? null,
      issueSummary: input.issueSummary,
      transcript: input.transcript ?? null,
      concreteScore,
      urgencyTag,
      sophistication,
      suggestedTier,
      deflected,
      status: deflected ? 'DEFLECTED' : 'PENDING',
    },
  });

  // ── Email notification (skip if deflected or no contact email) ─
  let emailSent = false;
  if (!deflected && inquiryEmail) {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/api/donna-respond?token=${inquiry.acceptToken}&action=accept`;
    const rejectUrl = `${baseUrl}/api/donna-respond?token=${inquiry.rejectToken}&action=reject`;

    const summary = buildInquirySummary(
      input.clientName ?? null,
      input.clientPhone ?? null,
      input.practiceArea ?? null,
      input.issueSummary,
      rawScore,
      urgencyTag
    );

    try {
      await sendInquiryEmail({
        to: inquiryEmail,
        lawyerName: profile.user.name ?? profile.firmName ?? 'Peguam',
        callerName: input.clientName ?? null,
        callerPhone: input.clientPhone ?? null,
        callerEmail: input.clientEmail ?? null,
        practiceArea: input.practiceArea ?? null,
        issueSummary: summary,
        concreteScore: rawScore,
        urgencyTag,
        conversionTier: suggestedTier,
        tierLabel: TIER_LABELS[suggestedTier] ?? suggestedTier,
        acceptUrl,
        rejectUrl,
      });

      await db.donnaInquiry.update({
        where: { id: inquiry.id },
        data: { status: 'EMAILED', emailSentAt: new Date() },
      });
      emailSent = true;
    } catch (emailError) {
      // Non-fatal: inquiry saved, email failed. Logged for ops to investigate.
      // SPOF #12 mitigation: surface the failure in the result so callers
      // can decide whether to retry or alert.
      console.error('createInquiry: email send failed for inquiry', inquiry.id, emailError);
    }
  }

  return {
    inquiryId: inquiry.id,
    deflected,
    urgencyTag,
    suggestedTier,
    emailSent,
  };
}
