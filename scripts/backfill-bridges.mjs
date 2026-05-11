/**
 * Backfill DonnaBridge rows: parse legacy `transcript` field into the new
 * `initialQuestion` / `initialAnswer` fields.
 *
 * Legacy formats handled:
 *   1. JSON string: {"question":"...","answer":"...","createdBy":"lawyer"}
 *      → initialQuestion = parsed.question, initialAnswer = parsed.answer
 *   2. Plain string: "saya nak saman boss saya..."
 *      → initialQuestion = the string, initialAnswer = "" (lawyer never vetted)
 *   3. null / empty → leave as-is (no-op)
 *
 * Idempotent: only updates rows where initialQuestion IS NULL.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

function parseTranscript(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Try JSON parse first
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed);
      if (obj && typeof obj === 'object') {
        return {
          initialQuestion: typeof obj.question === 'string' ? obj.question : trimmed,
          initialAnswer: typeof obj.answer === 'string' ? obj.answer : '',
        };
      }
    } catch {
      // fall through to plain-text
    }
  }

  // Plain text — treat as the original FB question, no lawyer answer
  return { initialQuestion: trimmed, initialAnswer: '' };
}

try {
  const candidates = await db.donnaBridge.findMany({
    where: { initialQuestion: null },
    select: { id: true, shortCode: true, transcript: true },
  });

  console.log(`Found ${candidates.length} bridge(s) needing backfill.`);

  let updated = 0;
  for (const b of candidates) {
    const parsed = parseTranscript(b.transcript);
    if (!parsed) {
      console.log(`  SKIP ${b.shortCode}: empty transcript`);
      continue;
    }
    await db.donnaBridge.update({
      where: { id: b.id },
      data: {
        initialQuestion: parsed.initialQuestion,
        initialAnswer: parsed.initialAnswer,
      },
    });
    updated++;
    console.log(
      `  ✓  ${b.shortCode}: Q="${parsed.initialQuestion.slice(0, 50)}..." A="${parsed.initialAnswer.slice(0, 50)}..."`
    );
  }

  console.log(`\nBackfill complete. Updated ${updated} of ${candidates.length} bridges.`);
} catch (err) {
  console.error('Backfill failed:', err);
  process.exit(1);
} finally {
  await db.$disconnect();
}
