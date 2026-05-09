import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { isActive } = await request.json();
    
    const bridge = await db.donnaBridge.update({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      data: { isActive },
    });

    return NextResponse.json(bridge);
  } catch (error) {
    console.error('Failed to update bridge:', error);
    return NextResponse.json({ error: 'Failed to update bridge' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.donnaBridge.delete({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete bridge:', error);
    return NextResponse.json({ error: 'Failed to delete bridge' }, { status: 500 });
  }
}
