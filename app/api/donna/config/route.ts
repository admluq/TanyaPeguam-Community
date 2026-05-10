import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await db.donnaConfig.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(config || {});
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const config = await db.donnaConfig.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...body,
      },
      update: body,
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Config POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
