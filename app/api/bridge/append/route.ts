// app/api/bridge/append/route.ts
// PATCH endpoint — "Save-on-Turn" for the intake widget
// Appends a single turn to bridge transcript + returns updated questionCount
// Prevents state drift on browser refresh

import { db } from '@/lib/db';
import { appendTurn } from '@/lib/bridge';
import { getNextQuestion, isIntakeComplete } from '@/lib/donna-simple';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bridgeId, conversationId, role, content, turnIndex } = body as {
      bridgeId: string;
      conversationId: string; // resume token — proof of session ownership
      role: 'user' | 'assistant';
      content: string;
      turnIndex: number;
    };

    if (!bridgeId || !conversationId || !role || !content || turnIndex === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify conversationId matches bridge (prevents replay attacks)
    const bridge = await db.donnaBridge.findUnique({
      where: { id: bridgeId },
      select: { id: true, conversationId: true, status: true, chatTranscript: true },
    });

    if (!bridge) {
      return Response.json({ error: 'Bridge not found' }, { status: 404 });
    }
    if (bridge.conversationId !== conversationId) {
      return Response.json({ error: 'Invalid conversation token' }, { status: 403 });
    }
    if (bridge.status !== 'ACTIVE') {
      return Response.json({ error: `Bridge is ${bridge.status}` }, { status: 409 });
    }

    // Append via chokepoint (idempotent — duplicates silently ignored)
    const updatedTranscript = await appendTurn(bridgeId, {
      role,
      content,
      turnIndex,
    });

    // Compute current question count
    const questionCount = updatedTranscript.filter((t) => t.role === 'user').length;
    const intakeComplete = isIntakeComplete(questionCount);

    return Response.json({
      success: true,
      questionCount,
      intakeComplete,
      transcriptLength: updatedTranscript.length,
    });
  } catch (error) {
    console.error('Bridge append error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
