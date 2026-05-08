import { PrismaClient, LinkType, Status } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  await prisma.cachedPreview.deleteMany();
  await prisma.link.deleteMany();
  await prisma.profile.deleteMany();
  console.log('✅ Cleaned existing data');

  // ─────────────────────────────────────────────
  // Profile 1: Adam Luqman Bin Iskandar Afian
  // ─────────────────────────────────────────────
  const adamLuqman = await prisma.profile.create({
    data: {
      slug: 'admluq',
      name: 'Adam Luqman Bin Iskandar Afian',
      title: 'Managing Lawyer',
      firm: 'ISCO',
      firmFull: 'Messrs Iskandar & Co',
      monogram: 'AL',
      location: 'Kota Bharu, Kelantan',
      status: Status.AVAILABLE,
      practiceAreas: ['Conveyancing', 'Corporate', 'Commercial'],
      isVerified: true,
      bio: 'Founder of TanyaPeguam and Managing Lawyer at Messrs Iskandar & Co. Specialises in conveyancing, corporate, and commercial matters in Kota Bharu, Kelantan.',
      metaTitle: 'Adam Luqman — Managing Lawyer, Messrs Iskandar & Co | TanyaPeguam',
      metaDescription: 'Peguam Conveyancing, Korporat & Komersial di Kota Bharu. Hubungi melalui WhatsApp untuk konsultasi.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'Hubungi Saya',
            subtitle: 'WhatsApp · 017-9800323',
            url: 'https://wa.me/60179800323',
            displayOrder: 1,
            metadata: {
              phone: '+60179800323',
              prefilledMessage: 'Salam Adam, saya nak tanya pasal...',
            },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Adam Luqman Iskandar Afian',
            url: 'https://facebook.com/Adam%20Luqman%20Iskandar%20Afian',
            displayOrder: 2,
            metadata: { handle: 'Adam Luqman Iskandar Afian' },
          },
          {
            type: LinkType.TIKTOK,
            label: 'TikTok',
            subtitle: '@admluq',
            url: 'https://tiktok.com/@admluq',
            displayOrder: 3,
            metadata: { handle: 'admluq' },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Adam Luqman Iskandar Afian',
            url: 'https://linkedin.com/in/adam-luqman-iskandar-afian',
            displayOrder: 4,
            metadata: { handle: 'adam-luqman-iskandar-afian' },
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
  console.log(`✅ Created profile: ${adamLuqman.slug} (with 5 links)`);

  // ─────────────────────────────────────────────
  // Profile 2: Rizlan Ghazali Chewan
  // ─────────────────────────────────────────────
  const rizlanGhazali = await prisma.profile.create({
    data: {
      slug: 'RizlanGhazali',
      name: 'Rizlan Ghazali Chewan',
      title: 'Senior Legal Counsel',
      firm: 'Chin Eng Adlina',
      firmFull: 'Messrs Chin Eng Adlina',
      monogram: 'RG',
      location: 'Shah Alam, Selangor',
      status: Status.AVAILABLE,
      practiceAreas: ['Conveyancing', 'Finance', 'Corporate', 'M&A'],
      isVerified: true,
      bio: 'Senior Legal Counsel at Chin Eng Adlina. Called to the Bar in 1994 (LLB Hons, IIUM). Career spans private practice and corporate legal leadership including Group Legal Adviser and banking compliance roles. Heads conveyancing, finance and corporate matters at the firm since 2014.',
      metaTitle: 'Rizlan Ghazali — Senior Legal Counsel, Chin Eng Adlina | TanyaPeguam',
      metaDescription: 'Peguam Kanan Conveyancing, Finance & Korporat di Shah Alam. Hubungi melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'Hubungi Saya',
            subtitle: 'WhatsApp · 014-5105382',
            url: 'https://wa.me/60145105382',
            displayOrder: 1,
            metadata: {
              phone: '+60145105382',
              prefilledMessage: 'Salam Rizlan, saya nak tanya pasal...',
            },
          },
          {
            type: LinkType.WEBSITE,
            label: 'Chin Eng Adlina',
            subtitle: 'ceasa.com.my',
            url: 'https://ceasa.com.my',
            displayOrder: 2,
            metadata: { domain: 'ceasa.com.my' },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'Rizlan Ghazali Chewan',
            url: 'https://facebook.com/Rizlan%20Ghazali%20Chewan',
            displayOrder: 3,
            metadata: { handle: 'Rizlan Ghazali Chewan' },
          },
          {
            type: LinkType.INSTAGRAM,
            label: 'Instagram',
            subtitle: '@AlanChewan',
            url: 'https://instagram.com/AlanChewan',
            displayOrder: 4,
            metadata: { handle: 'AlanChewan' },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Rizlan Ghazali',
            url: 'https://linkedin.com/in/rizlan-ghazali',
            displayOrder: 5,
            metadata: { handle: 'rizlan-ghazali' },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            url: 'https://app.tanyapeguam.com',
            displayOrder: 6,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log(`✅ Created profile: ${rizlanGhazali.slug} (with 6 links)`);

  // ─────────────────────────────────────────────
  // Profile 3: Muhammad Arif Azmi
  // ─────────────────────────────────────────────
  const arifAzmi = await prisma.profile.create({
    data: {
      slug: 'ArifAzmi',
      name: 'Muhammad Arif Azmi',
      title: 'Founder / Principal Lawyer',
      firm: 'Arif Azmi & Co.',
      firmFull: 'Arif Azmi & Co.',
      monogram: 'AA',
      location: 'Rawang, Selangor',
      status: Status.AVAILABLE,
      practiceAreas: ['Civil Litigation', 'Criminal', 'Conveyancing', 'Corporate', 'Commercial'],
      isVerified: true,
      bio: 'Founder of Arif Azmi & Co., a boutique legal firm in Rawang. Called to the Malaysian Bar in October 2020. Previously attached at Richard Wee Chambers and MahWengKwai & Associates. Known for hands-on, client-direct service in property conveyancing and civil matters.',
      metaTitle: 'Arif Azmi — Founder & Principal Lawyer, Arif Azmi & Co. | TanyaPeguam',
      metaDescription: 'Peguam Litigasi, Konveyan & Korporat di Rawang. Rating 4.9 ⭐ (59 ulasan). Hubungi melalui WhatsApp.',
      links: {
        create: [
          {
            type: LinkType.WHATSAPP,
            label: 'Hubungi Saya',
            subtitle: 'WhatsApp · 016-5577745',
            url: 'https://wa.me/60165577745',
            displayOrder: 1,
            metadata: {
              phone: '+60165577745',
              prefilledMessage: 'Salam Arif, saya nak tanya pasal...',
            },
          },
          {
            type: LinkType.WEBSITE,
            label: 'Arif Azmi & Co.',
            subtitle: 'arifazmico.com',
            url: 'https://arifazmico.com',
            displayOrder: 2,
            metadata: { domain: 'arifazmico.com' },
          },
          {
            type: LinkType.FACEBOOK,
            label: 'Facebook',
            subtitle: 'arifazmico',
            url: 'https://facebook.com/arifazmico',
            displayOrder: 3,
            metadata: {
              pageId: 'arifazmico',
              stats: { rating: 4.9, reviews: 59 },
            },
          },
          {
            type: LinkType.INSTAGRAM,
            label: 'Instagram',
            subtitle: '@arifazmico',
            url: 'https://instagram.com/arifazmico',
            displayOrder: 4,
            metadata: { handle: 'arifazmico' },
          },
          {
            type: LinkType.TIKTOK,
            label: 'TikTok',
            subtitle: '@arifazmi.co',
            url: 'https://tiktok.com/@arifazmi.co',
            displayOrder: 5,
            metadata: { handle: 'arifazmi.co' },
          },
          {
            type: LinkType.LINKEDIN,
            label: 'LinkedIn',
            subtitle: 'Muhammad Arif Azmi',
            url: 'https://linkedin.com/in/muhammad-arif-azmi',
            displayOrder: 6,
            metadata: { handle: 'muhammad-arif-azmi' },
          },
          {
            type: LinkType.AI_CHAT,
            label: 'Tanya Lia — AI Undang-Undang',
            subtitle: 'Jawapan segera, percuma',
            url: 'https://app.tanyapeguam.com',
            displayOrder: 7,
            metadata: { agentId: 'lia' },
          },
        ],
      },
    },
  });
  console.log(`✅ Created profile: ${arifAzmi.slug} (with 7 links)`);

  console.log('\n🎉 Seeding complete!\n');
  console.log('Test URLs:');
  console.log('   http://localhost:3000/admluq');
  console.log('   http://localhost:3000/RizlanGhazali');
  console.log('   http://localhost:3000/ArifAzmi');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
