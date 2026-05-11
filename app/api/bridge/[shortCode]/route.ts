import { NextRequest, NextResponse } from 'next/server';
import { getBridgeByShortCode } from '@/lib/bridge';

/**
 * GET /api/bridge/[shortCode]
 *
 * Public endpoint — no auth. Used by the client-facing /b/[shortCode] page
 * to load the bridge context (lawyer info + initial Q&A) before showing the
 * Donna widget.
 *
 * Returns only public-safe fields. The conversationId is the resume key
 * the widget will store in sessionStorage; it doubles as a soft auth token
 * for /api/chat/donna calls.
 *
 * 404 cases:
 *   - shortCode not found
 *   - bridge.status === 'ABANDONED' or 'COMPLETED' (per audit GC rules)
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;
  if (!shortCode || typeof shortCode !== 'string') {
    return NextResponse.json({ error: 'shortCode required' }, { status: 400 });
  }

  const bridge = await getBridgeByShortCode(shortCode);
  if (!bridge) {
    return NextResponse.json({ error: 'Bridge not found' }, { status: 404 });
  }

  // Closed bridges are not joinable. We return 410 Gone to differentiate
  // from "never existed" so the client can show a "Sesi luput" page.
  if (bridge.status === 'ABANDONED' || bridge.status === 'COMPLETED') {
    return NextResponse.json(
      { error: `Bridge is ${bridge.status}`, status: bridge.status },
      { status: 410 }
    );
  }

  return NextResponse.json({
    bridgeId: bridge.id,
    shortCode: bridge.shortCode,
    status: bridge.status,
    initialQuestion: bridge.initialQuestion,
    initialAnswer: bridge.initialAnswer,
    conversationId: bridge.conversationId,
    lawyer: {
      slug: bridge.profile.slug,
      name: bridge.profile.user.name,
      firmName: bridge.profile.firmName,
    },
    chatTranscript: bridge.chatTranscript ?? [],
    createdAt: bridge.createdAt,
  });
}
