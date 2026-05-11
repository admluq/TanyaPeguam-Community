import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/admin/bridges/purge
 * Permanently removes all DELETED bridges for the authenticated lawyer
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all DELETED bridges for this profile
    const deletedBridges = await db.donnaBridge.findMany({
      where: { profileId: profile.id, status: 'DELETED' },
      select: { id: true },
    });

    const bridgeIds = deletedBridges.map(b => b.id);

    if (bridgeIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No deleted bridges to purge',
        count: 0,
      });
    }

    // Delete related inquiries first
    await db.donnaInquiry.deleteMany({
      where: { bridgeId: { in: bridgeIds } },
    });

    // Delete the bridges
    const result = await db.donnaBridge.deleteMany({
      where: { id: { in: bridgeIds } },
    });

    return NextResponse.json({
      success: true,
      message: `Permanently deleted ${result.count} DELETED bridges`,
      count: result.count,
    });
  } catch (error) {
    console.error('Bridge purge error:', error);
    return NextResponse.json({ error: 'Failed to purge bridges' }, { status: 500 });
  }
}
