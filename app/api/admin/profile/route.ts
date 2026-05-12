import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/profile
 * Atomic upsert of LawyerProfile
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      slug,
      username,
      status,
      position,
      bio,
      firmName,
      firmPhone,
      firmWebsite,
      firmAddress,
      googleMapsUrl,
      googleReviewUrl,
      socialLinks,
      isPublic,
      avatarUrl,
    } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'slug is required and must be a string' },
        { status: 400 }
      );
    }

    const data = {
      slug: slug.toLowerCase().trim(),
      username: username || null,
      status: status || 'AVAILABLE',
      position: position || null,
      bio: bio || null,
      firmName: firmName || null,
      firmPhone: firmPhone || null,
      firmWebsite: firmWebsite || null,
      firmAddress: firmAddress || null,
      googleMapsUrl: googleMapsUrl || null,
      googleReviewUrl: googleReviewUrl || null,
      socialLinks: socialLinks || null,
      isPublic: isPublic ?? false,
      avatarUrl: avatarUrl || null,
    };

    const profile = await db.lawyerProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...data },
      update: data,
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Profile upsert error:', error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] ?? 'slug';
      return NextResponse.json(
        { error: `${field} already in use` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save profile' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
