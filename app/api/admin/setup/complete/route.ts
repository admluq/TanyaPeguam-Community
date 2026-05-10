import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/setup/complete
 * Mark the user's profile setup as completed
 * Called after user finishes Digital Card (Step 1)
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find and update lawyer's profile
    const profile = await db.lawyerProfile.update({
      where: { userId: session.user.id },
      data: { setupCompleted: true },
      select: { id: true, setupCompleted: true },
    });

    return NextResponse.json({
      success: true,
      setupCompleted: profile.setupCompleted,
      message: 'Setup marked as completed. Progress bar will hide.',
    });
  } catch (error) {
    console.error('Setup completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete setup' },
      { status: 500 }
    );
  }
}
