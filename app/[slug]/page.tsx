import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { ProfileHeader } from '@/components/profile/profile-header';
import { QuickActions } from '@/components/profile/quick-actions';
import { LiaWidget } from '@/components/profile/lia-widget';
import { LinkCard } from '@/components/profile/link-card';
import { ProfileFooter } from '@/components/profile/profile-footer';

export async function generateStaticParams() {
  const profiles = await prisma.profile.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return profiles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    select: { name: true, title: true, firm: true, location: true, bio: true, metaTitle: true, metaDescription: true },
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

  const aiLink = profile.links.find((l) => l.type === 'AI_CHAT');
  const waLink = profile.links.find((l) => l.type === 'WHATSAPP');
  const socialLinks = profile.links.filter((l) => l.type !== 'AI_CHAT');

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold-radial pointer-events-none opacity-50" />

      <div className="relative max-w-md mx-auto px-5 pt-12 pb-16">
        <ProfileHeader profile={profile} />

        <QuickActions links={profile.links} lawyerName={profile.name} />

        {aiLink && (
          <LiaWidget
            lawyerName={profile.name}
            practiceAreas={profile.practiceAreas}
            whatsappUrl={waLink?.url ?? undefined}
          />
        )}

        {socialLinks.length > 0 && (
          <>
            <p className="mt-8 mb-3 text-cream-muted text-[11px] uppercase tracking-[0.2em] text-center">
              Ikuti &amp; Berhubung
            </p>
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
              {socialLinks.map((link, i) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  animationDelay={`${300 + i * 60}ms`}
                />
              ))}
            </div>
          </>
        )}

        <ProfileFooter />
      </div>
    </main>
  );
}
