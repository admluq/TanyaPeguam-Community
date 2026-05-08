// Concreteness + urgency → conversion tier suggestion

export type ConversionTier = 'LOW' | 'MED' | 'HIGH';
export type UrgencyTag = 'STANDARD' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export function suggestTier(concreteScore: number, urgencyTag: UrgencyTag): ConversionTier {
  if (urgencyTag === 'CRITICAL' || (urgencyTag === 'HIGH' && concreteScore >= 6)) return 'HIGH';
  if (concreteScore >= 7 || urgencyTag === 'HIGH') return 'MED';
  if (concreteScore <= 3 && urgencyTag === 'STANDARD') return 'LOW';
  return 'MED';
}

export function detectUrgency(text: string): UrgencyTag {
  const lower = text.toLowerCase();
  const critical = ['ditangkap', 'ditahan', 'reman', 'kecemasan', 'hari ini', 'sekarang', 'malam ini'];
  const high = ['mahkamah esok', 'notis 24', 'saman', 'ancam', 'keganasan', 'rogol', 'pukul'];
  const medium = ['minggu depan', 'bulan depan', 'segera', 'perlu tahu'];

  if (critical.some((w) => lower.includes(w))) return 'CRITICAL';
  if (high.some((w) => lower.includes(w))) return 'HIGH';
  if (medium.some((w) => lower.includes(w))) return 'MEDIUM';
  return 'STANDARD';
}

export function scoreConcreness(text: string, isBridge = false): number {
  if (isBridge) return 7;

  const legalKeywords = [
    'kontrak', 'perjanjian', 'saman', 'mahkamah', 'harta', 'klausa',
    'seksyen', 'akta', 'liabiliti', 'tuntutan', 'pampasan', 'wasiat',
    'cuai', 'pelanggaran', 'injunksi', 'faraid',
  ];

  const wordCount = text.split(/\s+/).length;
  const keywordCount = legalKeywords.filter((k) => text.toLowerCase().includes(k)).length;

  let score = 4;
  if (wordCount > 50) score += 1;
  if (wordCount > 100) score += 1;
  if (keywordCount >= 1) score += 1;
  if (keywordCount >= 3) score += 1;

  return Math.min(10, score);
}

export function buildIssueSummary(
  practiceArea: string | null,
  callerName: string | null,
  responses: { question: string; answer: string }[],
): string {
  const name = callerName ?? 'Pemanggil';
  const area = practiceArea ?? 'kes umum';
  const lines = responses
    .filter((r) => r.answer.trim().length > 0)
    .map((r) => `- ${r.question}: ${r.answer}`);

  return [
    `${name} mencari bantuan berkaitan ${area}.`,
    ...lines,
  ].join('\n');
}
