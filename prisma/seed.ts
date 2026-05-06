/**
 * tptree — Database Seed
 * Run: npm run db:seed
 *
 * 3 real lawyer profiles:
 * - /adamluqman  — Adam Luqman Iskandar Afian (Iskandar & Co)
 * - /rizlan      — Rizlan Ghazali (Rizlan & Associates)
 * - /arifazmi   — Muhammad Arif Azmi (Arif Azmi & Co)
 */

import { PrismaClient, LinkType, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  await prisma.cachedPreview.deleteMany();
  await prisma.link.deleteMany();
  await prisma.profile.deleteMany();
  console.log('✅ Cleaned existing data');

  // ─────────────────────────────────────────────
  // Profile 1: Adam Luqman
  // ─────────────────────────────────────────────
  await prisma.profile.create({
    data: {
      slug: 'adamluqman',
      name: 'Adam Luqman Iskandar Afian',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'Iskandar & Co',
      firmFull: 'Iskandar & Co',
      monogram: 'AL',
      location: 'Kuala Lumpur',
      status: Status.AVAILABLE,
      practiceAreas: ['Sivil', 'Korporat'],
      isVerified: true,
      bio: 'Peguam Bela & Peguam Cara di Kuala Lumpur. Pakar dalam kes sivil dan korporat.',
      metaTitle: 'Adam Luqman Iskandar Afian — Peguam Bela | TanyaPeguam',
      metaDescription: 'Peguam Bela & Peguam Cara di KL. Hubungi melalui WhatsApp untuk konsultasi.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp',
            subtitle: 'Hubungi terus',
            url: 'https://wa.me/60179800323',
            displayOrder: 1,
            metadata: { phone: '+60179800323' },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: '017-980 0323',
            url: 'tel:+60179800323',
            displayOrder: 2,
            metadata: { phone: '+60179800323' },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Siaran terkini',
            url: 'https://linkedin.com/in/adamluqman',
            displayOrder: 3,
            metadata: {
              handle: 'adamluqman',
              manualPosts: [
                {
                  content: 'Perjanjian bertulis bukan sekadar formaliti — ia adalah perisai anda ketika pertikaian berlaku.\n\nJangan tunggu masalah timbul baru nak cari peguam.',
                  postedAt: '3 hari lalu',
                  reactions: { likes: 87, comments: 11 },
                },
              ],
            },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Iskandar & Co',
            url: 'https://facebook.com/iskandarco.law',
            displayOrder: 4,
            metadata: {
              pageId: 'iskandarco.law',
              stats: { likes: 2100, followers: 2400, rating: 4.8 },
            },
          },
          {
            type: LinkType.INSTAGRAM,
            label: 'Instagram',
            subtitle: '@adamluqman.law',
            url: 'https://instagram.com/adamluqman.law',
            displayOrder: 5,
            metadata: { handle: 'adamluqman.law' },
          },
          {
            type: LinkType.TIKTOK,
            label: 'TikTok',
            subtitle: 'Tip undang-undang harian',
            url: 'https://tiktok.com/@adamluqman.law',
            displayOrder: 6,
            metadata: {
              handle: 'adamluqman.law',
              videos: [
                { id: 'v1', caption: '3 perkara wajib dalam setiap kontrak' },
                { id: 'v2', caption: 'Bila anda boleh saman majikan' },
                { id: 'v3', caption: 'Hak penyewa yang ramai tak tahu' },
              ],
            },
          },
          {
            type: LinkType.YOUTUBE,
            label: 'YouTube',
            subtitle: 'Video undang-undang',
            url: 'https://youtube.com/@adamluqman.law',
            displayOrder: 7,
            metadata: { handle: 'adamluqman.law' },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            url: 'https://app.tanyapeguam.com',
            displayOrder: 8,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log('✅ Created profile: adamluqman (8 links)');

  // ─────────────────────────────────────────────
  // Profile 2: Rizlan Ghazali
  // ─────────────────────────────────────────────
  await prisma.profile.create({
    data: {
      slug: 'rizlan',
      name: 'Rizlan Ghazali',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'R&A',
      firmFull: 'Rizlan & Associates',
      monogram: 'RG',
      location: 'Shah Alam, Selangor',
      status: Status.AVAILABLE,
      practiceAreas: ['Jenayah', 'Sivil'],
      isVerified: true,
      bio: 'Peguam Bela & Peguam Cara di Shah Alam. Pakar dalam kes jenayah dan sivil.',
      metaTitle: 'Rizlan Ghazali — Peguam Bela | TanyaPeguam',
      metaDescription: 'Peguam Bela & Peguam Cara di Shah Alam. Hubungi melalui WhatsApp untuk konsultasi.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp',
            subtitle: 'Hubungi terus',
            url: 'https://wa.me/60145105382',
            displayOrder: 1,
            metadata: { phone: '+60145105382' },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: '014-510 5382',
            url: 'tel:+60145105382',
            displayOrder: 2,
            metadata: { phone: '+60145105382' },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Siaran terkini',
            url: 'https://linkedin.com/in/rizlanghazali',
            displayOrder: 3,
            metadata: {
              handle: 'rizlanghazali',
              manualPosts: [
                {
                  content: 'Ramai yang tidak tahu — anda ada hak untuk diam semasa ditahan polis. Gunakan hak itu dengan bijak.',
                  postedAt: '1 minggu lalu',
                  reactions: { likes: 203, comments: 34 },
                },
              ],
            },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Rizlan & Associates',
            url: 'https://facebook.com/rizlanassociates',
            displayOrder: 4,
            metadata: {
              pageId: 'rizlanassociates',
              stats: { likes: 3800, followers: 4200, rating: 4.9 },
            },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            url: 'https://app.tanyapeguam.com',
            displayOrder: 5,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log('✅ Created profile: rizlan (5 links)');

  // ─────────────────────────────────────────────
  // Profile 3: Muhammad Arif Azmi
  // ─────────────────────────────────────────────
  await prisma.profile.create({
    data: {
      slug: 'arifazmi',
      name: 'Muhammad Arif Azmi',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'Arif Azmi & Co',
      firmFull: 'Arif Azmi & Co',
      monogram: 'AA',
      location: 'Petaling Jaya, Selangor',
      status: Status.AVAILABLE,
      practiceAreas: ['Hartanah', 'Wasiat'],
      isVerified: true,
      bio: 'Peguam Bela & Peguam Cara di Petaling Jaya. Pakar dalam kes hartanah dan wasiat.',
      metaTitle: 'Muhammad Arif Azmi — Peguam Bela | TanyaPeguam',
      metaDescription: 'Peguam Bela & Peguam Cara di PJ. Pakar hartanah & wasiat. Hubungi melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp',
            subtitle: 'Hubungi terus',
            url: 'https://wa.me/60165577745',
            displayOrder: 1,
            metadata: { phone: '+60165577745' },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: '016-557 7745',
            url: 'tel:+60165577745',
            displayOrder: 2,
            metadata: { phone: '+60165577745' },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Siaran terkini',
            url: 'https://linkedin.com/in/muharifazmi',
            displayOrder: 3,
            metadata: {
              handle: 'muharifazmi',
              manualPosts: [
                {
                  content: 'Nak beli rumah? Pastikan anda faham perbezaan antara SPA dan LOO sebelum tandatangan apa-apa dokumen.',
                  postedAt: '4 hari lalu',
                  reactions: { likes: 156, comments: 28 },
                },
              ],
            },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Arif Azmi & Co',
            url: 'https://facebook.com/arifazmilaw',
            displayOrder: 4,
            metadata: {
              pageId: 'arifazmilaw',
              stats: { likes: 1600, followers: 1900, rating: 4.7 },
            },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            url: 'https://app.tanyapeguam.com',
            displayOrder: 5,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log('✅ Created profile: arifazmi (5 links)');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Live URLs:');
  console.log('   http://localhost:3000/adamluqman');
  console.log('   http://localhost:3000/rizlan');
  console.log('   http://localhost:3000/arifazmi');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
