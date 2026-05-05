/**
 * tptree — Database Seed
 * ─────────────────────────────────────────────────────
 * Run: npm run db:seed
 *
 * Profiles:
 *   /adamluqman  — Adam Luqman Iskandar Afian (Sivil & Korporat, KL)
 *   /rizlan      — Rizlan (placeholder — update contact details)
 *   /arifazmi    — Arif Azmi (placeholder — update contact details)
 */

import { PrismaClient, LinkType, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean slate
  await prisma.cachedPreview.deleteMany();
  await prisma.link.deleteMany();
  await prisma.profile.deleteMany();
  console.log('✅ Cleaned existing data\n');

  // ══════════════════════════════════════════════════════
  // Profile 1 — Adam Luqman Iskandar Afian
  // ══════════════════════════════════════════════════════
  const adam = await prisma.profile.create({
    data: {
      slug: 'adamluqman',
      name: 'Adam Luqman Iskandar Afian',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'Iskandar & Co',
      firmFull: 'Iskandar & Co Advocates & Solicitors',
      monogram: 'AL',
      location: 'Kuala Lumpur',
      status: Status.AVAILABLE,
      practiceAreas: ['Sivil', 'Korporat'],
      isVerified: true,
      bio: 'Peguam bela dan peguam cara yang berpengalaman dalam bidang sivil dan korporat di Kuala Lumpur. Mengutamakan penyelesaian efisien dan profesional untuk klien.',
      metaTitle: 'Adam Luqman Iskandar Afian — Peguam Bela & Peguam Cara | TanyaPeguam',
      metaDescription: 'Peguam bela dan peguam cara, pakar bidang sivil & korporat di Kuala Lumpur. Hubungi Adam Luqman terus melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp Saya',
            subtitle: 'Respons dalam 1 jam waktu pejabat',
            url: 'https://wa.me/60123456789?text=Salam%20Encik%20Adam%20Luqman,%20saya%20ingin%20mendapatkan%20khidmat%20guaman.',
            displayOrder: 1,
            metadata: {
              phone: '+60123456789',
              prefilledMessage: 'Salam Encik Adam Luqman, saya ingin mendapatkan khidmat guaman.',
            },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: '+603-XXXX XXXX · Waktu pejabat',
            url: 'tel:+60123456789',
            displayOrder: 2,
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Artikel & pandangan undang-undang',
            url: 'https://linkedin.com/in/adamluqman',
            displayOrder: 3,
            metadata: {
              handle: 'adamluqman',
              manualPosts: [
                {
                  content: 'Ramai yang tidak sedar bahawa perjanjian lisan juga boleh dikuatkuasakan di mahkamah Malaysia — tertakluk kepada syarat-syarat tertentu di bawah Akta Kontrak 1950.\n\nNamun, dokumentasi bertulis sentiasa menjadi perlindungan terbaik. Jangan ambil risiko.',
                  postedAt: '3 hari lalu',
                  reactions: { likes: 87, comments: 14 },
                },
                {
                  content: 'Langkah pertama bila anda dipecat secara tidak adil:\n\n1. Dapatkan surat penamatan bertulis\n2. Dokumentasikan semua komunikasi\n3. Hubungi peguam dalam 60 hari\n\nMasa adalah penting. Representasi awal = peluang lebih baik.',
                  postedAt: '1 minggu lalu',
                  reactions: { likes: 134, comments: 22 },
                },
              ],
            },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Tip undang-undang harian',
            url: 'https://facebook.com/adamluqmanlaw',
            displayOrder: 4,
            metadata: {
              pageId: 'adamluqmanlaw',
              stats: { likes: 1840, followers: 2100, rating: 4.8 },
              latestPost: 'Isu kontrak perniagaan? Jangan tunggu sehingga masalah menjadi lebih besar. Konsultasi awal boleh menyelamatkan masa dan wang anda. 📋',
            },
          },
          {
            type: LinkType.INSTAGRAM,
            label: 'Instagram',
            subtitle: '@adamluqmanlaw',
            url: 'https://instagram.com/adamluqmanlaw',
            displayOrder: 5,
            metadata: { handle: 'adamluqmanlaw' },
          },
          {
            type: LinkType.TIKTOK,
            label: 'TikTok',
            subtitle: 'Video pendek undang-undang Malaysia',
            url: 'https://tiktok.com/@adamluqmanlaw',
            displayOrder: 6,
            metadata: {
              handle: 'adamluqmanlaw',
              videos: [
                { id: 'v1', caption: '3 hak pekerja yang ramai tak tahu wujud' },
                { id: 'v2', caption: 'Kontrak sewaan — apa perlu ada?' },
                { id: 'v3', caption: 'Bila boleh saman majikan?' },
                { id: 'v4', caption: 'Perbezaan peguam sivil vs jenayah' },
              ],
            },
          },
          {
            type: LinkType.YOUTUBE,
            label: 'YouTube',
            subtitle: 'Penerangan kes & panduan guaman',
            url: 'https://youtube.com/@adamluqmanlaw',
            displayOrder: 7,
            metadata: { handle: 'adamluqmanlaw' },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            displayOrder: 8,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log(`✅ ${adam.slug} — ${adam.name} (${adam.links?.length ?? 8} links)`);

  // ══════════════════════════════════════════════════════
  // Profile 2 — Rizlan
  // TODO: Update with real contact details
  // ══════════════════════════════════════════════════════
  const rizlan = await prisma.profile.create({
    data: {
      slug: 'rizlan',
      name: 'Rizlan',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'Rizlan & Associates',
      firmFull: 'Rizlan & Associates Advocates & Solicitors',
      monogram: 'RL',
      location: 'Kuala Lumpur',
      status: Status.AVAILABLE,
      practiceAreas: ['Jenayah', 'Sivil'],
      isVerified: true,
      bio: 'Peguam berpengalaman dalam bidang jenayah dan sivil. Berkomited untuk memberikan representasi guaman yang efektif dan beretika.',
      metaTitle: 'Rizlan — Peguam Bela & Peguam Cara | TanyaPeguam',
      metaDescription: 'Peguam pakar jenayah dan sivil di Kuala Lumpur. Hubungi Rizlan terus melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp Saya',
            subtitle: 'Hubungi untuk konsultasi',
            // TODO: Replace with real WhatsApp number
            url: 'https://wa.me/60111234567?text=Salam%20Encik%20Rizlan,%20saya%20ingin%20mendapatkan%20khidmat%20guaman.',
            displayOrder: 1,
            metadata: {
              phone: '+60111234567',
              prefilledMessage: 'Salam Encik Rizlan, saya ingin mendapatkan khidmat guaman.',
            },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: 'Waktu pejabat',
            // TODO: Replace with real number
            url: 'tel:+60111234567',
            displayOrder: 2,
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Pandangan & artikel undang-undang',
            // TODO: Replace with real LinkedIn
            url: 'https://linkedin.com/in/rizlanlawyer',
            displayOrder: 3,
            metadata: { handle: 'rizlanlawyer' },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Halaman rasmi Rizlan & Associates',
            // TODO: Replace with real Facebook
            url: 'https://facebook.com/rizlanlaw',
            displayOrder: 4,
            metadata: {
              pageId: 'rizlanlaw',
              stats: { likes: 950, followers: 1100, rating: 4.7 },
            },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            displayOrder: 5,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log(`✅ ${rizlan.slug} — ${rizlan.name} (5 links)`);

  // ══════════════════════════════════════════════════════
  // Profile 3 — Arif Azmi
  // TODO: Update with real contact details
  // ══════════════════════════════════════════════════════
  const arifAzmi = await prisma.profile.create({
    data: {
      slug: 'arifazmi',
      name: 'Arif Azmi',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'Arif Azmi & Co',
      firmFull: 'Arif Azmi & Co Advocates & Solicitors',
      monogram: 'AA',
      location: 'Kuala Lumpur',
      status: Status.AVAILABLE,
      practiceAreas: ['Korporat', 'Hartanah'],
      isVerified: true,
      bio: 'Pakar dalam undang-undang korporat dan hartanah. Membantu individu dan syarikat menangani isu undang-undang perniagaan dan pelaburan hartanah.',
      metaTitle: 'Arif Azmi — Peguam Bela & Peguam Cara | TanyaPeguam',
      metaDescription: 'Peguam pakar korporat dan hartanah di Kuala Lumpur. Hubungi Arif Azmi terus melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp Saya',
            subtitle: 'Hubungi untuk konsultasi',
            // TODO: Replace with real WhatsApp number
            url: 'https://wa.me/60129876543?text=Salam%20Encik%20Arif%20Azmi,%20saya%20ingin%20mendapatkan%20khidmat%20guaman.',
            displayOrder: 1,
            metadata: {
              phone: '+60129876543',
              prefilledMessage: 'Salam Encik Arif Azmi, saya ingin mendapatkan khidmat guaman.',
            },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: 'Waktu pejabat',
            // TODO: Replace with real number
            url: 'tel:+60129876543',
            displayOrder: 2,
          },
          {
            type: LinkType.WEBSITE,
            label: 'Arif Azmi & Co',
            subtitle: 'arifazmi.com.my',
            // TODO: Replace with real website
            url: 'https://arifazmi.com.my',
            displayOrder: 3,
            metadata: { domain: 'arifazmi.com.my' },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Artikel & insights korporat',
            // TODO: Replace with real LinkedIn
            url: 'https://linkedin.com/in/arifazmi',
            displayOrder: 4,
            metadata: { handle: 'arifazmi' },
          },
          {
            type: LinkType.INSTAGRAM,
            label: 'Instagram',
            subtitle: '@arifazmilaw',
            // TODO: Replace with real Instagram
            url: 'https://instagram.com/arifazmilaw',
            displayOrder: 5,
            metadata: { handle: 'arifazmilaw' },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            displayOrder: 6,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log(`✅ ${arifAzmi.slug} — ${arifAzmi.name} (6 links)`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Profile URLs:');
  console.log('   http://localhost:3000/adamluqman');
  console.log('   http://localhost:3000/rizlan');
  console.log('   http://localhost:3000/arifazmi');
  console.log('\n⚠️  TODO: Update placeholder contact details for Rizlan & Arif Azmi in seed.ts');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
