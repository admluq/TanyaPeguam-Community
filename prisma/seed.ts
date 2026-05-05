/**
 * tptree — Database Seed
 * --------------------------------
 * Run: npm run db:seed
 *
 * Creates 3 sample lawyer profiles for testing multi-tenant routing:
 * - tanyapeguam.com/datukwanazmir (full data, matches artifact)
 * - tanyapeguam.com/ahmadrashid    (mid-level, mixed links)
 * - tanyapeguam.com/sitihasanah    (minimal, just contact)
 */

import { PrismaClient, LinkType, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.cachedPreview.deleteMany();
  await prisma.link.deleteMany();
  await prisma.profile.deleteMany();
  console.log('✅ Cleaned existing data');

  // ─────────────────────────────────────────────
  // Profile 1: Datuk Wan Azmir (matches artifact)
  // ─────────────────────────────────────────────
  const wanAzmir = await prisma.profile.create({
    data: {
      slug: 'datukwanazmir',
      name: 'Datuk Wan Azmir',
      title: 'Peguam Kanan',
      firm: 'HWAM',
      firmFull: 'Hafarizam Wan & Aisha Mubarak',
      monogram: 'WA',
      location: 'Kuala Lumpur',
      status: Status.AVAILABLE,
      practiceAreas: ['Korporat & Sivil'],
      isVerified: true,
      bio: 'Peguam kanan dengan lebih 20 tahun pengalaman dalam bidang korporat & sivil. Pakar dalam pertikaian perniagaan, kontrak komersial, dan perundangan syarikat di Mahkamah Tinggi Malaysia.',
      metaTitle: 'Datuk Wan Azmir — Peguam Kanan HWAM | TanyaPeguam',
      metaDescription: 'Peguam kanan korporat & sivil di Kuala Lumpur. Hubungi melalui WhatsApp untuk konsultasi.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'Hubungi Kami',
            subtitle: 'WhatsApp · Lokasi · Ulasan',
            url: 'https://wa.me/60123456789',
            displayOrder: 1,
            metadata: {
              phone: '+60123456789',
              prefilledMessage: 'Salam Datuk, saya nak konsultasi pasal...',
            },
          },
          {
            type: LinkType.WEBSITE,
            label: 'Hafarizam Wan & Aisha Mubarak',
            subtitle: 'hwam.com.my — live preview',
            url: 'https://hwam.com.my',
            displayOrder: 2,
            metadata: {
              domain: 'hwam.com.my',
            },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Siaran terkini',
            url: 'https://linkedin.com/in/datukwanazmir',
            displayOrder: 3,
            metadata: {
              handle: 'datukwanazmir',
              manualPosts: [
                {
                  content: 'Syarikat yang tidak mendaftarkan perjanjian perkongsian secara bertulis adalah seperti membina rumah tanpa asas.\n\nDalam 11 tahun amalan, **90% kes pertikaian perniagaan** yang kami kendalikan berpunca dari ketiadaan dokumentasi yang betul.\n\nLindungi perniagaan anda. **Hubungi HWAM hari ini.**',
                  postedAt: '2 hari lalu',
                  reactions: { likes: 142, comments: 23 },
                },
                {
                  content: 'Keputusan Mahkamah Rayuan minggu lepas menguatkan prinsip bahawa **notis surat pecat mesti mematuhi prosedur yang ditetapkan** — tidak kira saiz syarikat.\n\nKes ini adalah peringatan penting kepada semua majikan.',
                  postedAt: '1 minggu lalu',
                  reactions: { likes: 89, comments: 12 },
                },
              ],
            },
          },
          {
            type: LinkType.INSTAGRAM,
            label: 'Instagram',
            subtitle: '@datukwanazmir',
            url: 'https://instagram.com/datukwanazmir',
            displayOrder: 4,
            metadata: { handle: 'datukwanazmir' },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Halaman rasmi HWAM',
            url: 'https://facebook.com/hwam.my',
            displayOrder: 5,
            metadata: {
              pageId: 'hwam.my',
              stats: { likes: 8200, followers: 9100, rating: 4.9 },
              latestPost: 'HWAM dengan bangga mengumumkan kejayaan mempertahankan klien dalam kes kontrak bernilai RM2.3 juta di Mahkamah Tinggi KL. Alhamdulillah. 🤲',
            },
          },
          {
            type: LinkType.TIKTOK,
            label: 'TikTok',
            subtitle: 'Tip undang-undang harian',
            url: 'https://tiktok.com/@datukwanazmir',
            displayOrder: 6,
            metadata: {
              handle: 'datukwanazmir',
              videos: [
                { id: 'v1', caption: 'Bila kontrak anda tidak sah di sisi undang-undang' },
                { id: 'v2', caption: '3 perkara WAJIB dalam perjanjian sewaan' },
                { id: 'v3', caption: 'Hak pekerja: apa yang majikan tak boleh buat' },
                { id: 'v4', caption: 'Isu hartanah paling biasa di Malaysia' },
              ],
            },
          },
          {
            type: LinkType.TWITTER,
            label: 'Twitter / X',
            subtitle: 'Tweet terkini',
            url: 'https://x.com/datukwanazmir',
            displayOrder: 7,
            metadata: { handle: 'datukwanazmir' },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            url: 'https://app.tanyapeguam.com',
            displayOrder: 8,
            metadata: {
              agentId: 'lia',
              modelName: 'TanyaPeguam Legal Assistant',
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Created profile: ${wanAzmir.slug} (with ${8} links)`);

  // ─────────────────────────────────────────────
  // Profile 2: Ahmad Rashid (mid-level)
  // ─────────────────────────────────────────────
  const ahmadRashid = await prisma.profile.create({
    data: {
      slug: 'ahmadrashid',
      name: 'Ahmad Rashid bin Hassan',
      title: 'Peguam Bela & Peguam Cara',
      firm: 'AR Legal',
      firmFull: 'Ahmad Rashid & Associates',
      monogram: 'AR',
      location: 'Pulau Pinang',
      status: Status.AVAILABLE,
      practiceAreas: ['Jenayah', 'Keluarga'],
      isVerified: true,
      bio: 'Spesialis kes jenayah dan kekeluargaan di Pulau Pinang. Pengalaman 12 tahun di Mahkamah Sesyen dan Mahkamah Tinggi.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'Hubungi Saya',
            subtitle: 'WhatsApp · Konsultasi percuma 15 minit',
            url: 'https://wa.me/60134567890',
            displayOrder: 1,
            metadata: { phone: '+60134567890' },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'AR Legal Penang',
            url: 'https://facebook.com/arlegal.penang',
            displayOrder: 2,
            metadata: {
              pageId: 'arlegal.penang',
              stats: { likes: 1200, followers: 1450, rating: 4.7 },
            },
          },
          {
            type: LinkType.TIKTOK,
            label: 'TikTok',
            subtitle: 'Cerita kes & nasihat undang-undang',
            url: 'https://tiktok.com/@ahmadrashidlawyer',
            displayOrder: 3,
            metadata: { handle: 'ahmadrashidlawyer' },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            url: 'https://app.tanyapeguam.com',
            displayOrder: 4,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log(`✅ Created profile: ${ahmadRashid.slug} (with 4 links)`);

  // ─────────────────────────────────────────────
  // Profile 3: Siti Hasanah (minimal)
  // ─────────────────────────────────────────────
  const sitiHasanah = await prisma.profile.create({
    data: {
      slug: 'sitihasanah',
      name: 'Siti Hasanah binti Yusof',
      title: 'Peguam Bela',
      firm: 'SH Law',
      firmFull: 'Siti Hasanah Law Firm',
      monogram: 'SH',
      location: 'Kota Bharu, Kelantan',
      status: Status.BUSY,
      practiceAreas: ['Hartanah', 'Wasiat'],
      isVerified: false, // shows pending verification
      bio: 'Peguam hartanah dan wasiat di Kelantan. Pengalaman 5 tahun.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'WhatsApp',
            subtitle: 'Mesej sahaja, bukan call',
            url: 'https://wa.me/60145678901',
            displayOrder: 1,
            metadata: { phone: '+60145678901' },
          },
          {
            type: LinkType.EMAIL,
            label: 'Email',
            subtitle: 'siti@shlaw.my',
            url: 'mailto:siti@shlaw.my',
            displayOrder: 2,
          },
        ],
      },
    },
  });
  console.log(`✅ Created profile: ${sitiHasanah.slug} (with 2 links)`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Test URLs:');
  console.log('   http://localhost:3000/datukwanazmir');
  console.log('   http://localhost:3000/ahmadrashid');
  console.log('   http://localhost:3000/sitihasanah');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
