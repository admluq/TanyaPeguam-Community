import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, title, firm, firmFull, monogram, location, practiceAreas, bio, status, isVerified, isActive, slug, metaTitle, metaDescription, links } = body;

    // Check if profile already exists
    const existingProfile = await db.profile.findFirst({
      where: { user: { id: session.user.id } },
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await db.profile.update({
        where: { id: existingProfile.id },
        data: {
          name,
          title,
          firm,
          firmFull,
          monogram,
          location,
          practiceAreas,
          bio,
          status,
          isVerified,
          isActive,
          slug,
          metaTitle,
          metaDescription,
          links: links || [],
        },
      });
    } else {
      // Create new profile
      profile = await db.profile.create({
        data: {
          name,
          title,
          firm,
          firmFull,
          monogram,
          location,
          practiceAreas,
          bio,
          status,
          isVerified,
          isActive,
          slug: slug || name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'profile',
          metaTitle,
          metaDescription,
          links: links || [],
          user: {
            connect: { id: session.user.id },
          },
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to save profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await db.profile.findFirst({
      where: { user: { id: session.user.id } },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
