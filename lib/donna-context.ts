/**
 * lib/donna-context.ts — Context bundle + Anti-Hallucination utilities
 *
 * Builds the canonical "Context Bundle" injected into every Donna agent call.
 * This is the single source of truth that fixes Donna's statelessness — every
 * Anthropic system prompt gets the same four bundles regardless of which agent
 * is active.
 *
 * {DIGITAL CARD}      — Lawyer identity
 * {SOALAN ASAL}       — Original FB question (immutable)
 * {JAWAPAN PEGUAM}    — Lawyer's initial advice (immutable)
 * {DONNA AI CONFIG}   — KB, personality, deflect patterns, practice areas
 * {LEGAL SERVICE CONFIG} — Fees, hours, inquiry email
 */

import { db } from './db';

export interface ContextBundle {
  // Identity
  lawyerName: string;
  firmName: string;
  position: string | null;
  lawyerStatus: string;

  // Immutable source of truth from DonnaBridge
  soalanAsal: string | null;       // initialQuestion
  jawapanPeguam: string | null;    // initialAnswer

  // AI config
  kbContext: string | null;
  personality: string;
  practiceAreas: string[];
  deflectPatterns: string[];

  // Service config
  modKonsultasi: string;
  yuranKonsultasi: number | null;
  yuranKecemasan: number | null;
  yuranVideoMeeting: number | null;
  yuranMeetingFizikal: number | null;
  waktuOperasi: string | null;
  emelPertanyaan: string | null;
  negeriOperasi: string | null;
}

/**
 * Load the complete context bundle for a lawyer slug + optional bridge.
 * Called once per API turn — results are NOT cached so the context is always fresh.
 */
export async function buildContextBundle(
  slug: string,
  bridgeId?: string | null
): Promise<ContextBundle | null> {
  const profile = await db.lawyerProfile.findUnique({
    where: { slug },
    select: {
      status: true,
      position: true,
      firmName: true,
      user: { select: { name: true } },
      donnaConfig: {
        select: {
          kbContext: true,
          personality: true,
          triageRules: true,
        },
      },
      legalServiceConfig: {
        select: {
          modKonsultasi: true,
          yuranKonsultasi: true,
          yuranKecemasan: true,
          yuranVideoMeeting: true,
          yuranMeetingFizikal: true,
          waktuOperasi: true,
          emelPertanyaan: true,
          negeriOperasi: true,
        },
      },
    },
  });

  if (!profile) return null;

  // Extract practice areas and deflect patterns from triageRules JSON
  const triageRules = (profile.donnaConfig?.triageRules as {
    practiceAreas?: string[];
    deflectPatterns?: string[];
  } | null) ?? {};

  // Pull immutable Q&A from the bridge if provided
  let soalanAsal: string | null = null;
  let jawapanPeguam: string | null = null;
  if (bridgeId) {
    const bridge = await db.donnaBridge.findUnique({
      where: { id: bridgeId },
      select: { initialQuestion: true, initialAnswer: true },
    });
    soalanAsal = bridge?.initialQuestion ?? null;
    jawapanPeguam = bridge?.initialAnswer ?? null;
  }

  return {
    lawyerName: profile.user?.name ?? 'Peguam',
    firmName: profile.firmName ?? 'firma guaman ini',
    position: profile.position ?? null,
    lawyerStatus: profile.status,

    soalanAsal,
    jawapanPeguam,

    kbContext: profile.donnaConfig?.kbContext ?? null,
    personality: profile.donnaConfig?.personality ?? 'PROFESSIONAL',
    practiceAreas: triageRules.practiceAreas ?? [],
    deflectPatterns: triageRules.deflectPatterns ?? [],

    modKonsultasi: profile.legalServiceConfig?.modKonsultasi ?? 'PERCUMA',
    yuranKonsultasi: profile.legalServiceConfig?.yuranKonsultasi ?? null,
    yuranKecemasan: profile.legalServiceConfig?.yuranKecemasan ?? null,
    yuranVideoMeeting: profile.legalServiceConfig?.yuranVideoMeeting ?? null,
    yuranMeetingFizikal: profile.legalServiceConfig?.yuranMeetingFizikal ?? null,
    waktuOperasi: profile.legalServiceConfig?.waktuOperasi ?? null,
    emelPertanyaan: profile.legalServiceConfig?.emelPertanyaan ?? null,
    negeriOperasi: profile.legalServiceConfig?.negeriOperasi ?? null,
  };
}

/**
 * Detect the practice area from the Soalan Asal text.
 * Returns a canonical category string used by the Anti-Hallucination guardrail.
 */
export function detectPracticeAreaFromText(text: string | null): string {
  if (!text) return 'unknown';
  const t = text.toLowerCase();

  if (/\b(curi|pencuri|kecurian|rompak|pecah rumah|ragut|jenayah|tangkap|dadah|polis|jbb|IO|laporan polis)\b/.test(t)) {
    return 'criminal';
  }
  if (/\b(dipecat|terminate|majikan|pekerja|gaji|kontrak kerja|HRPT|JPP|industrial|dismissal|redundan)\b/.test(t)) {
    return 'employment';
  }
  if (/\b(cerai|talak|nafkah|hak penjagaan|anak|mahkamah syariah|kahwin|isteri|suami|fasakh)\b/.test(t)) {
    return 'family';
  }
  if (/\b(strata|jmb|jmc|mc|bangunan|kondominium|pangsapuri|pemilik petak|bocor|kerosakan)\b/.test(t)) {
    return 'strata';
  }
  if (/\b(tanah|hartanah|geran|spa|taman|pemaju|developer|rumah|lot|kaveat)\b/.test(t)) {
    return 'property';
  }
  if (/\b(hutang|pinjaman|bank|jumlah|faedah|kontrak|perjanjian|agreement|penghutang|kreditor)\b/.test(t)) {
    return 'debt_contract';
  }
  return 'general';
}

/**
 * Map a granular donna-chat sub-phase to a human-readable agent label.
 * Used by the Bridge Manager UI and the public bridge GET endpoint.
 */
export function phaseToAgentLabel(phase: string): string {
  if (['start', 'name_phone', 'email_opt', 'q1'].includes(phase)) return 'Agent A — Intake';
  if (phase === 'q2') return 'Agent B — Triage';
  if (['q3', 'q4'].includes(phase)) return 'Agent C — Market';
  if (phase === 'q5') return 'Agent D — Summary';
  if (phase === 'done') return 'Done';
  return 'Intake';
}

/**
 * Build the Anti-Hallucination document guardrail string for Agent B's system prompt.
 * Returns a formatted instruction block based on the detected practice area.
 */
export function buildAntiHallucinationGuardrail(soalanAsal: string | null): string {
  const area = detectPracticeAreaFromText(soalanAsal);

  const rules: Record<string, { whitelist: string[]; blacklist: string[] }> = {
    criminal: {
      whitelist: ['laporan polis', 'resit', 'bukti video/foto', 'keterangan saksi', 'surat dari IO', 'rekod mahkamah jenayah'],
      blacklist: ['agreement', 'kontrak', 'saman sivil', 'SPA', 'strata title', 'borang JPP'],
    },
    employment: {
      whitelist: ['surat tamat kontrak', 'payslip', 'warning letter', 'kontrak pekerjaan', 'Form A JPP', 'surat pertanyaan majikan'],
      blacklist: ['laporan polis', 'strata title', 'SPA', 'borang 28', 'sijil kahwin'],
    },
    family: {
      whitelist: ['sijil kahwin', 'kad pengenalan', 'sijil lahir anak', 'dokumen mahkamah syariah', 'rekod aset bersama'],
      blacklist: ['laporan polis', 'kontrak pekerjaan', 'strata title', 'agreement perniagaan'],
    },
    strata: {
      whitelist: ['Borang 28', 'surat aduan kepada JMB/MC', 'foto kerosakan', 'resit bayaran', 'minit mesyuarat AGM', 'strata title'],
      blacklist: ['laporan polis', 'sijil kahwin', 'kontrak kerja', 'SPA pemaju'],
    },
    property: {
      whitelist: ['SPA', 'geran tanah', 'resit bayaran', 'surat pemaju', 'kaveat', 'perjanjian jual beli'],
      blacklist: ['laporan polis', 'kontrak kerja', 'sijil kahwin', 'borang JPP'],
    },
    debt_contract: {
      whitelist: ['perjanjian pinjaman', 'resit bayaran', 'penyata bank', 'surat tuntutan', 'kontrak asal'],
      blacklist: ['laporan polis', 'sijil kahwin', 'strata title', 'borang JPP'],
    },
  };

  const rule = rules[area];
  if (!rule) {
    return `Detected practice area: GENERAL. Recommend documents relevant to the client's specific issue. Do NOT guess categories.`;
  }

  return `ANTI-HALLUCINATION GUARDRAIL (CRITICAL — follow exactly):
Detected practice area from Soalan Asal: ${area.toUpperCase()}
WHITELIST — only recommend documents from this list (or very close equivalents):
  ${rule.whitelist.map((d) => `• ${d}`).join('\n  ')}
BLACKLIST — NEVER recommend these document types for this case:
  ${rule.blacklist.map((d) => `✗ ${d}`).join('\n  ')}
If the client asks about a BLACKLIST document, say: "Untuk kes seperti ini, dokumen itu tidak relevan. Yang lebih penting ialah [whitelist item]."`;
}
