import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ProfileHeader } from '@/components/profile/profile-header';
import { LinkCard } from '@/components/profile/link-card';
import { ProfileFooter } from '@/components/profile/profile-footer';

// ─── Static params (SSG for known profiles) ─────────
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

  const title = profile.metaTitle ?? `${profile.name} — ${profile.title}`;
  const description =
    profile.metaDescription ??
    profile.bio ??
    `${profile.name}, ${profile.title} di ${profile.location}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'profile' },
    twitter: { card: 'summary', title, description },
  };
}

// ─── Page component ─────────────────────────────────
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

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Decorative gold halo behind avatar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-radial pointer-events-none opacity-50" />

      <div className="relative max-w-md mx-auto px-5 py-12">
        {/* Profile header */}
        <ProfileHeader profile={profile} />

        {/* Links list */}
        <div className="mt-10 space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
          {profile.links.map((link, i) => (
            <LinkCard
              key={link.id}
              link={link}
              animationDelay={`${300 + i * 60}ms`}
            />
          ))}
        </div>

        {/* Footer */}
        <ProfileFooter />
      </div>
    </main>
  );
}
