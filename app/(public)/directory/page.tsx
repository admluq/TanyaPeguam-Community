import { db } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function DirectoryPage() {
  // Fetch all public profiles
  const profiles = await db.lawyerProfile.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      donnaConfig: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-gold-400 hover:text-gold-300 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-cream mb-3">Registered Lawyers Directory</h1>
          <p className="text-cream/80 text-lg">
            Find qualified lawyers on TanyaPeguam. All profiles verified and active.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-base border border-gold/20 rounded-lg p-6">
            <div className="text-3xl font-bold text-gold-400">{profiles.length}</div>
            <p className="text-cream/80 text-sm mt-1">Registered Lawyers</p>
          </div>
          <div className="card-base border border-gold/20 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400">
              {profiles.filter((p) => p.donnaConfig).length}
            </div>
            <p className="text-cream/80 text-sm mt-1">With Donna AI Active</p>
          </div>
          <div className="card-base border border-gold/20 rounded-lg p-6">
            <div className="text-3xl font-bold text-purple-400">24/7</div>
            <p className="text-cream/80 text-sm mt-1">Intake Support</p>
          </div>
        </div>

        {/* Profiles Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cream/80 text-lg mb-4">No registered lawyers yet.</p>
            <p className="text-cream/50">Be the first to register and set up your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/directory/${profile.slug}`}
                className="group"
              >
                <div className="card-base border border-gold/20 hover:border-blue-500 rounded-lg p-6 transition h-full cursor-pointer">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-cream group-hover:text-gold-400 transition">
                        {profile.user?.name || 'Unnamed'}
                      </h3>
                      {profile.firmName && (
                        <p className="text-sm text-cream/50 mt-1">{profile.firmName}</p>
                      )}
                    </div>
                    {profile.donnaConfig && (
                      <div className="flex items-center gap-1 bg-green-900 px-2 py-1 rounded text-xs text-green-300">
                        <span>●</span> Active
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-cream/80 text-sm mb-4 line-clamp-3">
                      {profile.bio}
                    </p>
                  )}

                  {/* Donna Config Info */}
                  {profile.donnaConfig && (
                    <div className="mb-4 pb-4 border-t border-gold/20 pt-4">
                      <div className="text-xs text-cream/50 mb-2">
                        <span className="inline-block bg-purple-900 text-purple-300 px-2 py-1 rounded mr-2">
                          {profile.donnaConfig.personality}
                        </span>
                      </div>
                      {profile.donnaConfig.triageRules && typeof profile.donnaConfig.triageRules === 'object' && (
                        <div className="text-xs text-cream/50">
                          {Array.isArray((profile.donnaConfig.triageRules as any).practiceAreas) && (
                            <p>
                              Practice: <span className="text-cream/80">
                                {((profile.donnaConfig.triageRules as any).practiceAreas as string[]).join(', ') || 'General'}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center text-gold-400 text-sm font-semibold group-hover:gap-2 transition gap-1">
                    View Profile →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
