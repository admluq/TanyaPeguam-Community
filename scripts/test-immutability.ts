/**
 * Verify the Anti-Reset Lock middleware in lib/db.ts works.
 *  - update with `initialQuestion` → throws
 *  - update with `initialAnswer` → throws
 *  - update with `summary` (allowed field) → succeeds
 */
import { db } from '../lib/db';

async function main(): Promise<number> {
  const ANY_BRIDGE = await db.donnaBridge.findFirst({
    select: { id: true, shortCode: true },
  });
  if (!ANY_BRIDGE) {
    console.log('No bridges in DB to test against. Skipping.');
    return 0;
  }
  console.log(`Testing on bridge ${ANY_BRIDGE.shortCode} (id=${ANY_BRIDGE.id})`);

  let pass = 0;
  let fail = 0;

  try {
    await db.donnaBridge.update({
      where: { id: ANY_BRIDGE.id },
      data: { initialQuestion: 'HACKED' },
    });
    console.log('  ❌ FAIL: initialQuestion update should have thrown');
    fail++;
  } catch (e: any) {
    if (String(e.message).includes('IMMUTABLE_FIELD_VIOLATION')) {
      console.log('  ✓  PASS: initialQuestion update blocked');
      pass++;
    } else {
      console.log('  ❌ FAIL: wrong error:', e.message);
      fail++;
    }
  }

  try {
    await db.donnaBridge.update({
      where: { id: ANY_BRIDGE.id },
      data: { initialAnswer: 'HACKED' },
    });
    console.log('  ❌ FAIL: initialAnswer update should have thrown');
    fail++;
  } catch (e: any) {
    if (String(e.message).includes('IMMUTABLE_FIELD_VIOLATION')) {
      console.log('  ✓  PASS: initialAnswer update blocked');
      pass++;
    } else {
      console.log('  ❌ FAIL: wrong error:', e.message);
      fail++;
    }
  }

  try {
    await db.donnaBridge.update({
      where: { id: ANY_BRIDGE.id },
      data: { summary: 'test summary OK to change' },
    });
    console.log('  ✓  PASS: summary update allowed');
    pass++;
    await db.donnaBridge.update({
      where: { id: ANY_BRIDGE.id },
      data: { summary: null },
    });
  } catch (e: any) {
    console.log('  ❌ FAIL: summary update was blocked unexpectedly:', e.message);
    fail++;
  }

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  return fail > 0 ? 1 : 0;
}

main()
  .then((code) => db.$disconnect().then(() => process.exit(code)))
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
