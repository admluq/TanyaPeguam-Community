import { NextRequest, NextResponse } from 'next/server';
import { getBridgeByShortCode } from '@/lib/bridge';
import { phaseToAgentLabel } from '@/lib/donna-context';

/**
 * GET /api/bridge/[shortCode]
 *
 * Public endpoint — no auth. Used by the client-facing /b/[shortCode] page to
 * load bridge context (lawyer info + initial Q&A) and for widget state recovery
 * on page refresh.
 *
 * Returns chatPhase, agentTurnCount, and extractedEntities so the widget can
 * reconstruct exact conversation state without relying on client storage.
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

  // Closed bridges are not joinable — 410 Gone so the client can show "Sesi luput"
  if (bridge.status === 'COMPLETED' || bridge.status === 'EXPIRED' || bridge.status === 'DELETED') {
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

    // Server-authoritative state (for widget hydration on refresh)
    chatPhase: bridge.chatPhase,
    agentTurnCount: bridge.agentTurnCount,
    agentLabel: phaseToAgentLabel(bridge.chatPhase),
    extractedEntities: bridge.extractedEntities ?? {},

    lawyer: {
      slug: bridge.profile.slug,
      name: bridge.profile.user.name,
      firmName: bridge.profile.firmName,
    },
    chatTranscript: bridge.chatTranscript ?? [],
    createdAt: bridge.createdAt,
  });
}
