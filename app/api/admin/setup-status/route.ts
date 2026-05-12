import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export interface SetupStep {
  id: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
}

export interface SetupStatusResponse {
  steps: SetupStep[];
  completedCount: number;
  totalCount: number;
  allDone: boolean;
}

/**
 * GET /api/admin/setup-status
 * Returns the completion state of each onboarding phase for the logged-in lawyer.
 * Single DB round-trip with all related tables.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await db.lawyerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      slug: true,
      username: true,
      firmName: true,
      bio: true,
      isPublic: true,
      donnaConfig: { select: { id: true, kbContext: true } },
      legalServiceConfig: { select: { id: true, modKonsultasi: true } },
      bridges: {
        select: { id: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Profile doesn't exist at all yet
  const profileExists = !!profile;
  const profileDone =
    profileExists && !!(profile.slug && (profile.username || profile.firmName));
  const legalDone = profileExists && !!profile.legalServiceConfig;
  const donnaDone =
    profileExists &&
    !!profile.donnaConfig &&
    !!(profile.donnaConfig.kbContext?.trim());
  const bridgeDone = profileExists && profile.bridges.length > 0;
  const publishDone = profileExists && profile.isPublic;

  const steps: SetupStep[] = [
    {
      id: 'profile',
      label: 'Digital Card Setup',
      description: 'Add your name, firm, and slug',
      done: profileDone,
      href: '/profile',
    },
    {
      id: 'legal',
      label: 'Legal Service Config',
      description: 'Set consultation mode and fees',
      done: legalDone,
      href: '/legal-service',
    },
    {
      id: 'donna',
      label: 'Donna AI Config',
      description: 'Add knowledge base and practice areas',
      done: donnaDone,
      href: '/donna',
    },
    {
      id: 'bridge',
      label: 'First Bridge Link Created',
      description: 'Create your first client intake bridge',
      done: bridgeDone,
      href: '/bridges',
    },
    {
      id: 'publish',
      label: 'Publish to Directory',
      description: 'Make your Digital Card public',
      done: publishDone,
      href: '/profile',
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;

  return NextResponse.json({
    steps,
    completedCount,
    totalCount: steps.length,
    allDone: completedCount === steps.length,
  } satisfies SetupStatusResponse);
}
