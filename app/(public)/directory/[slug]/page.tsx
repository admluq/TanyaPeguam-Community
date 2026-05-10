import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const profile = await db.lawyerProfile.findUnique({
    where: { slug: params.slug },
    include: { user: true },
  });

  if (!profile || !profile.isPublic) {
    return { title: 'Lawyer not found' };
  }

  return {
    title: `${profile.user?.name || 'Lawyer'} | TanyaPeguam Directory`,
    description: profile.bio || `Lawyer profile on TanyaPeguam`,
    openGraph: {
      title: `${profile.user?.name || 'Lawyer'} | TanyaPeguam`,
      description: profile.bio || 'Registered lawyer',
      type: 'profile',
    },
  };
}

export async function generateStaticParams() {
  const profiles = await db.lawyerProfile.findMany({
    where: { isPublic: true },
    select: { slug: true },
  });

  return profiles.map((p) => ({
    slug: p.slug,
  }));
}

export default async function LawyerProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const profile = await db.lawyerProfile.findUnique({
    where: { slug: params.slug },
    include: {
      user: true,
      donnaConfig: true,
    },
  });

  if (!profile || !profile.isPublic) {
    notFound();
  }

  const socialLinks = (profile.socialLinks as any) || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link href="/directory" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to Directory
        </Link>

        {/* Profile Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          {/* Name & Firm */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              {profile.user?.name || 'Lawyer'}
            </h1>
            {profile.firmName && (
              <p className="text-lg text-gray-300">{profile.firmName}</p>
            )}
            {profile.donnaConfig && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-gray-300">Donna AI Active</span>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-8 pb-8 border-b border-slate-700">
              <p className="text-gray-300 text-lg leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Donna Config */}
          {profile.donnaConfig && (
            <div className="mb-8 pb-8 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">AI Assistant</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Personality</p>
                  <p className="inline-block bg-purple-900 text-purple-300 px-3 py-1 rounded text-sm font-semibold">
                    {profile.donnaConfig.personality}
                  </p>
                </div>

                {profile.donnaConfig.kbContext && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">About this Lawyer</p>
                    <p className="text-gray-300">
                      {profile.donnaConfig.kbContext}
                    </p>
                  </div>
                )}

                {profile.donnaConfig.triageRules && typeof profile.donnaConfig.triageRules === 'object' && (
                  <div>
                    {Array.isArray((profile.donnaConfig.triageRules as any).practiceAreas) &&
                      ((profile.donnaConfig.triageRules as any).practiceAreas as string[]).length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Practice Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {((profile.donnaConfig.triageRules as any).practiceAreas as string[]).map((area) => (
                            <span
                              key={area}
                              className="bg-blue-900 text-blue-300 px-3 py-1 rounded text-sm"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Contact & Links</h2>
              <div className="space-y-2">
                {socialLinks.whatsapp && (
                  <a
                    href={`https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-green-900 hover:bg-green-800 rounded text-green-300 transition"
                  >
                    📱 WhatsApp: {socialLinks.whatsapp}
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-blue-900 hover:bg-blue-800 rounded text-blue-300 transition"
                  >
                    🔗 LinkedIn
                  </a>
                )}
                {socialLinks.website && (
                  <a
                    href={socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-purple-900 border border-purple-700 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Need Legal Advice?</h3>
          <p className="text-purple-200 mb-4">
            Use Donna AI to quickly assess if this lawyer can help with your case.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition">
            Start Intake Chat
          </button>
        </div>
      </div>
    </div>
  );
}
