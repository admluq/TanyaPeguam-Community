import { nanoid } from 'nanoid';

/**
 * Generate accept and reject tokens for magic link emails
 */
export function generateTokens() {
  return {
    acceptToken: nanoid(32),
    rejectToken: nanoid(32),
  };
}

/**
 * Score concreteness of an inquiry (0-10)
 * Based on presence of specific keywords and detail level
 */
export function scoreConcreteScore(issueSummary: string, isBridgeInquiry: boolean = false): number {
  if (isBridgeInquiry) return 7; // Bridge inquiries have context, so higher baseline

  // Count detail indicators
  let score = 5; // baseline

  // Specific details increase score
  if (/tanggal|tarikh|date/i.test(issueSummary)) score += 1;
  if (/nilai|amount|rm|ringgit|jumlah/i.test(issueSummary)) score += 1;
  if (/nama|name|siapa|who/i.test(issueSummary)) score += 1;
  if (/kontrak|agreement|contract/i.test(issueSummary)) score += 1;
  if (/bukti|evidence|proof|dokumen|document/i.test(issueSummary)) score += 1;

  // Vague language decreases score
  if (/mungkin|might|boleh jadi|tidak pasti|uncertain/i.test(issueSummary)) score -= 1;
  if (/entah|tidak tahu|not sure|tak sure/i.test(issueSummary)) score -= 1;

  return Math.max(0, Math.min(10, score));
}

/**
 * Determine urgency tag based on keywords
 */
export function determineUrgency(issueSummary: string): 'STANDARD' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const text = issueSummary.toLowerCase();

  // CRITICAL indicators
  if (/sudah masuk mahkamah|sudah di mahkamah|dalam mahkamah|court hearing|perbicaraan/i.test(text)) {
    return 'CRITICAL';
  }
  if (/tarikh hari ini|today|esok|tomorrow|tiga hari|three days|minggu depan/i.test(text)) {
    return 'CRITICAL';
  }

  // HIGH indicators
  if (/polisi|polis|police report|laporan polis|arrest|ditangkap|penahanan/i.test(text)) {
    return 'HIGH';
  }
  if (/kekerasan|violence|rogol|rape|serangan|assault|ancaman|threat/i.test(text)) {
    return 'HIGH';
  }
  if (/denda|penalty|fine|penjara|jail|hukuman/i.test(text)) {
    return 'HIGH';
  }

  // MEDIUM indicators
  if (/minggu|week|bulan|month|pertikaian|dispute|pertikai|perselisihan/i.test(text)) {
    return 'MEDIUM';
  }
  if (/hutang|berhutang|debt|owing|pembayaran|payment/i.test(text)) {
    return 'MEDIUM';
  }

  return 'STANDARD';
}

/**
 * Suggest conversion tier based on concreteness and urgency
 */
export function suggestConversionTier(
  concreteScore: number,
  urgencyTag: string
): 'LOW' | 'MED' | 'HIGH' {
  // CRITICAL urgency → HIGH tier (always)
  if (urgencyTag === 'CRITICAL') return 'HIGH';

  // HIGH urgency → MED or HIGH
  if (urgencyTag === 'HIGH') {
    return concreteScore >= 6 ? 'HIGH' : 'MED';
  }

  // MEDIUM urgency
  if (urgencyTag === 'MEDIUM') {
    if (concreteScore >= 7) return 'HIGH';
    if (concreteScore >= 4) return 'MED';
    return 'LOW';
  }

  // STANDARD urgency (most inquiries)
  if (concreteScore >= 8) return 'HIGH';
  if (concreteScore >= 5) return 'MED';
  return 'LOW';
}

/**
 * Check if inquiry matches deflection patterns
 */
export function shouldDeflect(issueSummary: string, deflectPatterns: string[]): boolean {
  if (!deflectPatterns || deflectPatterns.length === 0) return false;

  const text = issueSummary.toLowerCase();
  return deflectPatterns.some((pattern) => {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(text);
    } catch {
      // If regex is invalid, do substring match
      return text.includes(pattern.toLowerCase());
    }
  });
}

/**
 * Detect sophistication level (legal vs lay person language)
 */
export function detectSophistication(text: string): 'lay' | 'intermediate' | 'sophisticated' {
  const legalTerms = [
    'mahkamah', 'hakim', 'advokat', 'peguam', 'perundangan',
    'statut', 'ordinans', 'syariah', 'sivil',
    'plaintif', 'defendan', 'tuntutan', 'penggugat',
  ];

  const layTerms = [
    'saya', 'dia', 'mereka', 'apa', 'bagaimana', 'mengapa',
    'boleh', 'tidak', 'sudah', 'belum',
  ];

  const legalCount = legalTerms.filter((t) => text.toLowerCase().includes(t)).length;
  const wordCount = text.split(/\s+/).length;

  if (legalCount >= 3) return 'sophisticated';
  if (legalCount >= 1 && wordCount > 50) return 'intermediate';
  return 'lay';
}

/**
 * Build a summary email from inquiry details
 */
export function buildInquirySummary(
  callerName: string | null,
  callerPhone: string | null,
  practiceArea: string | null,
  issueSummary: string,
  concreteScore: number,
  urgencyTag: string
): string {
  const lines = [
    `PEMANGGIL: ${callerName ?? 'Tidak dikenali'}`,
    `TELEFON: ${callerPhone ?? '—'}`,
    `KAWASAN: ${practiceArea ?? 'Umum'}`,
    `SKOR KONKRIT: ${concreteScore}/10`,
    `KEMENDESAKAN: ${urgencyTag}`,
    '',
    'RINGKASAN ISU:',
    issueSummary,
  ];

  return lines.join('\n');
}
