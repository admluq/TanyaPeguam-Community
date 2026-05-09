import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ProfileSetup } from '@/components/profile/profile-setup';

export const metadata = { title: 'Profil Peguam — Dashboard' };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const profile = await db.profile.findFirst({
    where: { user: { id: session.user.id } },
  });

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-text-primary mb-1">Profil Peguam</h1>
        <p className="text-text-secondary text-sm">
          Uruskan profil profesional anda untuk TanyaPeguam.
        </p>
      </div>

      <ProfileSetup initialProfile={profile} />
    </div>
  );
}
