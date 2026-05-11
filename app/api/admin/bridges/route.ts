// app/api/admin/bridges/route.ts
// GET — list all bridges owned by the authenticated lawyer
// Auto-expires ACTIVE bridges older than 3 days on each fetch

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { autoExpireStale } from '@/lib/bridge';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Auto-expire stale bridges before fetching
    await autoExpireStale(profile.id);

    const bridges = await db.donnaBridge.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shortCode: true,
        status: true,
        createdBy: true,
        initialQuestion: true,
        initialAnswer: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        practiceArea: true,
        summary: true,
        chatTranscript: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const list = bridges.map((b) => {
      const transcript = Array.isArray(b.chatTranscript)
        ? (b.chatTranscript as Array<{ role: string }>)
        : [];
      return {
        id: b.id,
        shortCode: b.shortCode,
        status: b.status,
        createdBy: b.createdBy,
        initialQuestion: b.initialQuestion,
        initialAnswer: b.initialAnswer,
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        clientPhone: b.clientPhone,
        practiceArea: b.practiceArea,
        summary: b.summary,
        turnCount: transcript.filter((t) => t.role === 'user').length,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    return NextResponse.json({ success: true, bridges: list });
  } catch (error) {
    console.error('Bridge list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bridges' },
      { status: 500 }
    );
  }
}
