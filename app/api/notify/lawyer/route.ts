// app/api/notify/lawyer/route.ts
// POST endpoint — dispatches intake summary email to the lawyer
// Called automatically when intake completes, or manually from admin

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { formatIntakeForEmail, extractKeyInfo } from '@/lib/donna-simple';
import { sendSimpleIntakeSummary } from '@/lib/email-donna';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bridgeId } = body as { bridgeId: string };

    if (!bridgeId) {
      return Response.json({ error: 'Missing bridgeId' }, { status: 400 });
    }

    // Get bridge + profile + user
    const bridge = await db.donnaBridge.findUnique({
      where: { id: bridgeId },
      include: {
        profile: {
          include: { user: true },
        },
      },
    });

    if (!bridge) {
      return Response.json({ error: 'Bridge not found' }, { status: 404 });
    }

    // Verify ownership
    if (bridge.profile.user.id !== session.user.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Build transcript
    const transcript = (bridge.chatTranscript as unknown as Array<{
      role: string;
      content: string;
    }>) ?? [];

    if (transcript.length === 0) {
      return Response.json(
        { error: 'No transcript to send' },
        { status: 400 }
      );
    }

    const formattedTranscript = formatIntakeForEmail(transcript);
    const { issue } = extractKeyInfo(transcript);

    // Send email
    const result = await sendSimpleIntakeSummary({
      lawyerEmail: bridge.profile.user.email,
      lawyerName: bridge.profile.username || bridge.profile.user.name || 'Lawyer',
      firmName: bridge.profile.firmName || 'Law Firm',
      clientEmail: bridge.clientEmail || undefined,
      clientPhone: bridge.clientPhone || undefined,
      issue,
      transcript: formattedTranscript,
      bridgeShortCode: bridge.shortCode,
    });

    if (!result.success) {
      return Response.json(
        { error: result.error || 'Email failed' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      messageId: result.messageId,
      sentTo: bridge.profile.user.email,
    });
  } catch (error) {
    console.error('Notify lawyer error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
