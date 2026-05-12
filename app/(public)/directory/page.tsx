import { db } from '@/lib/db';
import Link from 'next/link';
import LawyerAvatar from '@/components/LawyerAvatar';

export const revalidate = 60;

const statusStyle: Record<string, { dot: string; label: string; border: string }> = {
  AVAILABLE: { dot: 'bg-green-400', label: 'Available', border: 'border-green-500/40' },
  BUSY:      { dot: 'bg-yellow-400', label: 'Busy',      border: 'border-yellow-500/40' },
  AWAY:      { dot: 'bg-orange-400', label: 'Away',      border: 'border-orange-500/40' },
  OFFLINE:   { dot: 'bg-red-400',   label: 'Offline',   border: 'border-red-500/40' },
};

export default async function DirectoryPage() {
  const profiles = await db.lawyerProfile.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      username: true,
      position: true,
      firmName: true,
      bio: true,
      status: true,
      avatarUrl: true,
      donnaConfig: { select: { id: true } },
      user: { select: { name: true, image: true } },
    },
  });

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-purple-400 hover:text-purple-300 mb-4 inline-block text-sm">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-cream mb-3">Registered Lawyers Directory</h1>
          <p className="text-cream/60 text-lg">
            Find qualified lawyers on TanyaPeguam. All profiles verified and active.
          </p>
        </div>

        {/* Profiles Grid */}
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-cream/80 text-lg mb-4">No registered lawyers yet.</p>
            <p className="text-cream/50">Be the first to register and set up your profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const st = statusStyle[profile.status] ?? statusStyle.OFFLINE;
              return (
                <Link key={profile.id} href={`/directory/${profile.slug}`} className="group">
                  <div className={`border ${st.border} hover:border-purple-500/60 rounded-lg p-6 transition h-full cursor-pointer bg-white/[0.02] hover:bg-white/[0.04]`}>
                    {/* Avatar */}
                    <LawyerAvatar
                      avatarUrl={profile.avatarUrl}
                      googleImage={profile.user?.image}
                      name={profile.username || profile.user?.name || 'P'}
                      size={56}
                      className="rounded-xl mb-4"
                    />
                    {/* Name + Status badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-cream group-hover:text-purple-400 transition truncate">
                          {profile.username || profile.user?.name || 'Unnamed'}
                        </h3>
                        {/* Position */}
                        {profile.position && (
                          <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide mt-1">
                            {profile.position}
                          </p>
                        )}
                        {/* Firm Name */}
                        {profile.firmName && (
                          <p className="text-sm text-cream/50 mt-1">{profile.firmName}</p>
                        )}
                      </div>
                      {/* Status */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${st.border} bg-black ml-3 flex-shrink-0`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        <span className="text-xs text-cream/70 font-medium">{st.label}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-cream/60 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        {profile.donnaConfig && (
                          <span className="text-xs text-green-400 font-medium">● Donna AI</span>
                        )}
                      </div>
                      <span className="text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
