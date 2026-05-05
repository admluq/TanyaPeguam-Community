import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ProfileHeader } from '@/components/profile/profile-header';
import { QuickActions } from '@/components/profile/quick-actions';
import { LiaWidget } from '@/components/profile/lia-widget';
import { LinkCard } from '@/components/profile/link-card';
import { ProfileFooter } from '@/components/profile/profile-footer';

// ─── Static params for SSG ───────────────────────────
export async function generateStaticParams() {
  const profiles = await prisma.profile.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return profiles.map((p) => ({ slug: p.slug }));
}

// ─── Dynamic metadata per profile ───────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      title: true,
      firm: true,
      location: true,
      bio: true,
      metaTitle: true,
      metaDescription: true,
    },
  });

  if (!profile) return { title: 'Profil tidak dijumpai' };

  const title = profile.metaTitle ?? `${profile.name} — ${profile.title} | TanyaPeguam`;
  const description =
    profile.metaDescription ??
    profile.bio ??
    `${profile.name}, ${profile.title} di ${profile.location}. Hubungi terus melalui TanyaPeguam.com.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
    twitter: { card: 'summary', title, description },
  };
}

// ─── Helper: extract phone href from links ───────────
function getPhoneHref(
  links: Array<{ type: string; url: string | null; metadata: unknown }>
): string | null {
  // Prefer explicit PHONE link
  const phoneLink = links.find((l) => l.type === 'PHONE');
  if (phoneLink?.url) return phoneLink.url;

  // Fallback: derive tel: from WhatsApp metadata
  const waLink = links.find((l) => l.type === 'WHATSAPP');
  if (waLink?.metadata && typeof waLink.metadata === 'object' && !Array.isArray(waLink.metadata)) {
    const meta = waLink.metadata as Record<string, unknown>;
    if (typeof meta.phone === 'string') {
      const digits = meta.phone.replace(/\D/g, '');
      return `tel:+${digits}`;
    }
  }
  return null;
}

// ─── Page ────────────────────────────────────────────
export default async function ProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug, isActive: true },
    include: {
      links: {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!profile) notFound();

  // ── Derived link data ──────────────────────────────
  const waLink = profile.links.find((l) => l.type === 'WHATSAPP');
  const aiChatLink = profile.links.find((l) => l.type === 'AI_CHAT');
  const phoneHref = getPhoneHref(profile.links);

  // Exclude AI_CHAT from visible link list — it's rendered as the Lia widget
  const visibleLinks = profile.links.filter((l) => l.type !== 'AI_CHAT');

  return (
    <main className="relative min-h-screen overflow-x-hidden">

      {/* Ambient gold halo at top */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold-radial opacity-40"
      />

      <div className="relative max-w-md mx-auto px-5 pt-12 pb-16">

        {/* ── Profile header ──────────────────────────── */}
        <ProfileHeader profile={profile} />

        {/* ── Quick action buttons ─────────────────────── */}
        <QuickActions
          waLink={waLink?.url}
          phoneHref={phoneHref}
          bookingLink={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/book`}
        />

        {/* ── Lia AI widget (only if AI_CHAT link exists) ── */}
        {aiChatLink && (
          <div className="mt-6">
            <LiaWidget
              lawyerName={profile.name}
              practiceAreas={profile.practiceAreas}
              waLink={waLink?.url}
            />
          </div>
        )}

        {/* ── Link cards ──────────────────────────────── */}
        {visibleLinks.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-cream-muted/60 px-1 mb-2">
              Ikuti &amp; Berhubung
            </p>
            {visibleLinks.map((link, i) => (
              <LinkCard
                key={link.id}
                link={link}
                animationDelay={`${300 + i * 60}ms`}
              />
            ))}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────── */}
        <ProfileFooter />
      </div>
    </main>
  );
}
