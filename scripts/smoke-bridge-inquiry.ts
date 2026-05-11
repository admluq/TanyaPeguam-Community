/**
 * Phase 2 verification — full bridge → inquiry round-trip with bridgeId.
 *
 * 1. Look up an existing bridge (any of our 2 backfilled rows)
 * 2. POST an inquiry citing that bridgeId via the public endpoint
 * 3. Read back the DonnaInquiry row and assert bridgeId was persisted
 *
 * Proves SPOF #14 is fixed: the inquiry IS now linked to the bridge.
 */
import { db } from '../lib/db';

const BASE = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

async function main() {
  // 1. Pick the JSON-style bridge (has lawyer answer too)
  const bridge = await db.donnaBridge.findFirst({
    where: { shortCode: '0MfczGeh' },
    select: { id: true, profileId: true, shortCode: true, initialQuestion: true, initialAnswer: true },
  });
  if (!bridge) throw new Error('Test bridge 0MfczGeh missing — was it deleted?');

  console.log(`Bridge:    ${bridge.shortCode}  id=${bridge.id}`);
  console.log(`profileId: ${bridge.profileId}`);
  console.log(`Q: "${bridge.initialQuestion?.slice(0, 60)}..."`);
  console.log(`A: "${bridge.initialAnswer?.slice(0, 60)}..."`);
  console.log('');

  // 2. POST inquiry
  const tag = `AUDIT-${Date.now()}`;
  console.log(`Posting inquiry with clientName="${tag}" + bridgeId=${bridge.id} ...`);
  const res = await fetch(`${BASE}/api/admin/donna-inquiry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId: bridge.profileId,
      bridgeId: bridge.id,
      clientName: tag,
      clientPhone: '0123456789',
      practiceArea: 'perumahan',
      issueSummary:
        'Phase 2 smoke test — kontraktor lari dengan duit deposit, rumah 40% siap. Saya kat Selangor.',
    }),
  });
  const json = await res.json();
  console.log(`HTTP ${res.status} → ${JSON.stringify(json)}`);
  console.log('');

  // 3. Read back from DB
  const inq = await db.donnaInquiry.findFirst({
    where: { clientName: tag },
    select: {
      id: true,
      bridgeId: true,
      status: true,
      urgencyTag: true,
      suggestedTier: true,
      concreteScore: true,
      deflected: true,
    },
  });

  if (!inq) {
    console.log('❌ FAIL: inquiry not found in DB');
    process.exit(1);
  }
  console.log('Inquiry row:');
  console.log(JSON.stringify(inq, null, 2));

  if (inq.bridgeId !== bridge.id) {
    console.log(`\n❌ FAIL: bridgeId mismatch. expected ${bridge.id}, got ${inq.bridgeId}`);
    process.exit(1);
  }
  console.log(`\n✓ PASS: inquiry.bridgeId === ${bridge.id} (SPOF #14 fixed)`);

  // Cleanup the test row
  await db.donnaInquiry.delete({ where: { id: inq.id } });
  console.log('  (cleanup: removed test inquiry)');
}

main()
  .then(() => db.$disconnect().then(() => process.exit(0)))
  .catch(async (e) => {
    console.error('FAILED:', e);
    await db.$disconnect();
    process.exit(1);
  });
