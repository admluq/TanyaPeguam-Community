import { auth } from '@/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { source, question, practiceArea, keyFacts } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Soalan diperlukan' },
        { status: 400 }
      );
    }

    const refCode = nanoid(8);

    const bridge = await db.donnaBridge.create({
      data: {
        userId: session.user.id,
        refCode,
        source: source || 'Facebook Group',
        question,
        practiceArea,
        keyFacts,
      },
    });

    return NextResponse.json({
      id: bridge.id,
      refCode: bridge.refCode,
    });
  } catch (error) {
    console.error('Bridge POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const refCode = searchParams.get('refCode');

    if (!refCode) {
      return NextResponse.json({ error: 'refCode required' }, { status: 400 });
    }

    const bridge = await db.donnaBridge.findUnique({
      where: { refCode },
    });

    if (!bridge) {
      return NextResponse.json({ error: 'Bridge not found' }, { status: 404 });
    }

    // Increment click count
    await db.donnaBridge.update({
      where: { id: bridge.id },
      data: {
        clickCount: { increment: 1 },
        lastClickAt: new Date(),
      },
    });

    return NextResponse.json({
      question: bridge.question,
      practiceArea: bridge.practiceArea,
      keyFacts: bridge.keyFacts,
    });
  } catch (error) {
    console.error('Bridge GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
