import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/donna-config
 * Atomic upsert of DonnaConfig for the lawyer's profile
 *
 * Body:
 * {
 *   kbContext?: string
 *   personality?: 'PROFESSIONAL' | 'SOFT' | 'STRICT'
 *   triageRules?: object
 * }
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

    // Get the user's profile
    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'LawyerProfile not found. Create profile first.' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { kbContext, personality = 'PROFESSIONAL', triageRules } = body;

    // Atomic upsert: create if doesn't exist, update if does
    const config = await db.donnaConfig.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        kbContext: kbContext || null,
        personality: personality || 'PROFESSIONAL',
        triageRules: triageRules || null,
      },
      update: {
        kbContext: kbContext || null,
        personality: personality || 'PROFESSIONAL',
        triageRules: triageRules || null,
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        profileId: config.profileId,
        kbContext: config.kbContext,
        personality: config.personality,
        triageRules: config.triageRules,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('DonnaConfig upsert error:', error);

    return NextResponse.json(
      { error: 'Failed to upsert DonnaConfig' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/donna-config
 * Fetch the authenticated user's DonnaConfig
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user's profile
    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'LawyerProfile not found' },
        { status: 404 }
      );
    }

    const config = await db.donnaConfig.findUnique({
      where: { profileId: profile.id },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'DonnaConfig not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('DonnaConfig fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch DonnaConfig' },
      { status: 500 }
    );
  }
}
