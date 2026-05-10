/**
 * TanyaPeguam — Database Seed
 * --------------------------------
 * Run: npm run db:seed
 *
 * Creates sample lawyer profiles and Donna configurations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.donnaBridge.deleteMany({});
  await prisma.donnaConfig.deleteMany({});
  await prisma.lawyerProfile.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Cleaned existing data');

  // Note: Users must sign in with Google first
  // Profiles will be created via /api/admin/profile endpoint
  console.log('✅ Database ready for lawyer signup');
  console.log('   1. Sign in with Google at /login');
  console.log('   2. Create profile via POST /api/admin/profile');
  console.log('   3. Configure Donna via POST /api/admin/donna-config');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
