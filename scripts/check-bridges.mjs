import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

try {
  const bridges = await db.donnaBridge.findMany({
    select: { id: true, shortCode: true, transcript: true, status: true, createdAt: true },
  });
  console.log(`Bridges in DB: ${bridges.length}`);
  bridges.forEach((b) => {
    console.log(`  ${b.shortCode} [${b.status}] @ ${b.createdAt.toISOString()}`);
    console.log(`    transcript: ${(b.transcript || '').slice(0, 300)}`);
  });
} finally {
  await db.$disconnect();
}
