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
  // Profile 2 — Rizlan Ghazali
  // ══════════════════════════════════════════════════════
  const rizlan = await prisma.profile.create({
    data: {
      slug: 'rizlan',
      name: 'Rizlan Ghazali',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'Rizlan & Associates',
      firmFull: 'Rizlan & Associates Advocates & Solicitors',
      monogram: 'RG',
      location: 'Kuala Lumpur',
      status: Status.AVAILABLE,
      practiceAreas: ['Jenayah', 'Sivil'],
      isVerified: true,
      bio: 'Peguam berpengalaman dalam bidang jenayah dan sivil. Berkomited untuk memberikan representasi guaman yang efektif dan beretika.',
      metaTitle: 'Rizlan Ghazali — Peguam Bela & Peguam Cara | TanyaPeguam',
      metaDescription: 'Peguam pakar jenayah dan sivil. Hubungi Rizlan Ghazali terus melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp Saya',
            subtitle: 'Hubungi untuk konsultasi',
            url: 'https://wa.me/60145105382?text=Salam%20Encik%20Rizlan,%20saya%20ingin%20mendapatkan%20khidmat%20guaman.',
            displayOrder: 1,
            metadata: {
              phone: '+60145105382',
              prefilledMessage: 'Salam Encik Rizlan, saya ingin mendapatkan khidmat guaman.',
            },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: '014-510 5382 · Waktu pejabat',
            url: 'tel:+60145105382',
            displayOrder: 2,
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Pandangan & artikel undang-undang',
            url: 'https://www.linkedin.com/in/rizlan-ghazali-482942170/',
            displayOrder: 3,
            metadata: { handle: 'rizlan-ghazali-482942170' },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Rizlan Ghazali Chewan',
            url: 'https://www.facebook.com/rizlan.ghazali.chewan/',
            displayOrder: 4,
            metadata: {
              pageId: 'rizlan.ghazali.chewan',
              stats: { likes: 0, followers: 0, rating: 5.0 },
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
  // Profile 3 — Muhammad Arif Azmi
  // ══════════════════════════════════════════════════════
  const arifAzmi = await prisma.profile.create({
    data: {
      slug: 'arifazmi',
      name: 'Muhammad Arif Azmi',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'Arif Azmi & Co',
      firmFull: 'Arif Azmi & Co Advocates & Solicitors',
      monogram: 'AA',
      location: 'Kuala Lumpur',
      status: Status.AVAILABLE,
      practiceAreas: ['Korporat', 'Hartanah'],
      isVerified: true,
      bio: 'Pakar dalam undang-undang korporat dan hartanah. Membantu individu dan syarikat menangani isu undang-undang perniagaan dan pelaburan hartanah.',
      metaTitle: 'Muhammad Arif Azmi — Peguam Bela & Peguam Cara | TanyaPeguam',
      metaDescription: 'Peguam pakar korporat dan hartanah. Hubungi Muhammad Arif Azmi terus melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp Saya',
            subtitle: 'Hubungi untuk konsultasi',
            url: 'https://wa.me/60165577745?text=Salam%20Encik%20Arif%20Azmi,%20saya%20ingin%20mendapatkan%20khidmat%20guaman.',
            displayOrder: 1,
            metadata: {
              phone: '+60165577745',
              prefilledMessage: 'Salam Encik Arif Azmi, saya ingin mendapatkan khidmat guaman.',
            },
          },
          {
            type: LinkType.PHONE,
            label: 'Telefon',
            subtitle: '016-557 7745 · Waktu pejabat',
            url: 'tel:+60165577745',
            displayOrder: 2,
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Artikel & insights korporat',
            url: 'https://my.linkedin.com/in/muhammad-arif-azmi-2958ab117',
            displayOrder: 3,
            metadata: { handle: 'muhammad-arif-azmi-2958ab117' },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Arif Azmi & Co',
            url: 'https://www.facebook.com/arifazmico/',
            displayOrder: 4,
            metadata: {
              pageId: 'arifazmico',
              stats: { likes: 0, followers: 0, rating: 5.0 },
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
  console.log(`✅ ${arifAzmi.slug} — ${arifAzmi.name} (5 links)`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Profile URLs:');
  console.log('   http://localhost:3000/adamluqman');
  console.log('   http://localhost:3000/rizlan');
  console.log('   http://localhost:3000/arifazmi');
  console.log('\n⚠️  Seterusnya: Tambah ANTHROPIC_API_KEY dalam .env untuk aktifkan Lia AI.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
