import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/profile
 * Atomic upsert of LawyerProfile
 *
 * Body:
 * {
 *   slug: string (required, unique)
 *   firmName?: string
 *   bio?: string
 *   socialLinks?: object
 *   isPublic?: boolean
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

    const body = await req.json();
    const { slug, firmName, bio, socialLinks, isPublic } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'slug is required and must be a string' },
        { status: 400 }
      );
    }

    // Atomic upsert: create if doesn't exist, update if does
    const profile = await db.lawyerProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        slug: slug.toLowerCase(),
        firmName: firmName || null,
        bio: bio || null,
        socialLinks: socialLinks || null,
        isPublic: isPublic ?? false,
      },
      update: {
        slug: slug.toLowerCase(),
        firmName: firmName || null,
        bio: bio || null,
        socialLinks: socialLinks || null,
        isPublic: isPublic ?? false,
      },
    });

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        userId: profile.userId,
        slug: profile.slug,
        firmName: profile.firmName,
        bio: profile.bio,
        socialLinks: profile.socialLinks,
        isPublic: profile.isPublic,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Profile upsert error:', error);

    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] ?? 'slug';
      return NextResponse.json(
        { error: `${field} already in use` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upsert profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/profile
 * Fetch the authenticated user's profile
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

    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
