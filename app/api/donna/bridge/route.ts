import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  const refCode = req.nextUrl.searchParams.get('ref');
  if (!refCode) return NextResponse.json({ error: 'Missing ref' }, { status: 400 });

  const bridge = await db.donnaBridge.findUnique({
    where: { refCode },
    select: {
      id: true,
      source: true,
      question: true,
      practiceArea: true,
      keyFacts: true,
      isActive: true,
      expiresAt: true,
      user: { select: { name: true, profile: { select: { name: true, slug: true } } } },
    },
  });

  if (!bridge) return NextResponse.json({ error: 'Bridge not found' }, { status: 404 });
  if (!bridge.isActive) return NextResponse.json({ error: 'Bridge inactive' }, { status: 410 });
  if (bridge.expiresAt && bridge.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Bridge expired' }, { status: 410 });
  }

  // Increment click count
  await db.donnaBridge.update({
    where: { refCode },
    data: { clickCount: { increment: 1 }, lastClickAt: new Date() },
  });

  return NextResponse.json(bridge);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (!body.question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 });

  const refCode = nanoid(8);

  const bridge = await db.donnaBridge.create({
    data: {
      userId: session.user.id,
      refCode,
      source: body.source,
      question: body.question,
      practiceArea: body.practiceArea,
      keyFacts: body.keyFacts,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanyapeguam.com';
  return NextResponse.json({ ...bridge, url: `${baseUrl}/bridge/${refCode}` });
}
