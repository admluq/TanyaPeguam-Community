/**
 * Bridge helper — the SINGLE chokepoint for all DonnaBridge writes.
 *
 * No other code in the app may call `db.donnaBridge.create()` directly. All
 * bridge mutations go through `createBridge()` (writes immutable Source of
 * Truth) or `appendTurn()` (read-modify-writes the chat log atomically).
 *
 * The Anti-Reset Lock middleware in lib/db.ts will throw if any caller tries
 * to mutate `initialQuestion` / `initialAnswer` after creation.
 */

import { nanoid } from 'nanoid';
import { db } from './db';
import type { BridgeStatus, DonnaBridge } from '@prisma/client';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatTurn {
  role: ChatRole;
  content: string;
  ts: string; // ISO timestamp
  turnIndex: number;
  toolCalls?: Array<{ name: string; input: unknown }>;
  retryToken?: string; // present when role='system' and content='CLAUDE_TIMEOUT'
}

export interface CreateBridgeInput {
  profileId: string;
  initialQuestion: string;
  initialAnswer: string;
  createdBy?: 'lawyer' | 'system' | 'inbound';
}

/**
 * Create a new bridge with the immutable initial Q&A.
 *
 * - Generates an 8-char shortCode and 32-char conversationId (resume key)
 * - Initialises chatTranscript to empty array
 * - Returns the full bridge row
 *
 * @throws if `initialQuestion` or `initialAnswer` is empty/whitespace.
 */
export async function createBridge(input: CreateBridgeInput): Promise<DonnaBridge> {
  const initialQuestion = (input.initialQuestion ?? '').trim();
  const initialAnswer = (input.initialAnswer ?? '').trim();

  if (!initialQuestion) {
    throw new Error('createBridge: initialQuestion is required');
  }
  if (!initialAnswer) {
    throw new Error('createBridge: initialAnswer is required');
  }
  if (!input.profileId) {
    throw new Error('createBridge: profileId is required');
  }

  return db.donnaBridge.create({
    data: {
      profileId: input.profileId,
      shortCode: nanoid(8),
      conversationId: nanoid(32),
      status: 'ACTIVE',
      createdBy: input.createdBy ?? 'lawyer',
      initialQuestion,
      initialAnswer,
      chatTranscript: [],
    },
  });
}

/**
 * Append a single turn to the bridge's chat log atomically.
 *
 * Uses read-modify-write because Prisma JSONB doesn't support array-append
 * primitives. To minimise the race window, callers should serialise turns
 * per-bridge at the API layer (idempotency guard in /api/chat/donna handles
 * this via turnIndex check).
 *
 * Idempotent: if a turn with the same turnIndex+role+content already exists,
 * returns the existing transcript without duplicate insertion.
 *
 * @throws if bridgeId is unknown, or if the bridge is not ACTIVE.
 */
export async function appendTurn(
  bridgeId: string,
  turn: Omit<ChatTurn, 'ts'> & { ts?: string }
): Promise<ChatTurn[]> {
  const bridge = await db.donnaBridge.findUnique({
    where: { id: bridgeId },
    select: { id: true, status: true, chatTranscript: true },
  });
  if (!bridge) throw new Error(`appendTurn: bridge ${bridgeId} not found`);
  if (bridge.status !== 'ACTIVE') {
    throw new Error(`appendTurn: bridge ${bridgeId} is ${bridge.status}, not ACTIVE`);
  }

  const transcript = (bridge.chatTranscript as unknown as ChatTurn[]) ?? [];

  // Idempotency: same turnIndex + role + content = no-op
  const existing = transcript.find(
    (t) => t.turnIndex === turn.turnIndex && t.role === turn.role && t.content === turn.content
  );
  if (existing) {
    return transcript;
  }

  const newTurn: ChatTurn = {
    role: turn.role,
    content: turn.content,
    turnIndex: turn.turnIndex,
    ts: turn.ts ?? new Date().toISOString(),
    ...(turn.toolCalls && { toolCalls: turn.toolCalls }),
    ...(turn.retryToken && { retryToken: turn.retryToken }),
  };

  const next = [...transcript, newTurn];

  await db.donnaBridge.update({
    where: { id: bridgeId },
    data: { chatTranscript: next as unknown as object },
  });

  return next;
}

/**
 * Public lookup by shortCode — used by /api/bridge/[shortCode] for the
 * client-facing intake page. Returns only public-safe fields.
 */
export async function getBridgeByShortCode(shortCode: string) {
  const bridge = await db.donnaBridge.findUnique({
    where: { shortCode },
    select: {
      id: true,
      shortCode: true,
      status: true,
      initialQuestion: true,
      initialAnswer: true,
      chatTranscript: true,
      conversationId: true,
      createdAt: true,
      profile: {
        select: {
          slug: true,
          username: true,
          position: true,
          firmName: true,
          user: { select: { name: true } },
        },
      },
    },
  });
  return bridge;
}

/**
 * Hydration endpoint helper — verifies the conversationId resume token
 * matches the bridge before returning state to the widget.
 */
export async function getBridgeState(bridgeId: string, conversationId: string) {
  const bridge = await db.donnaBridge.findUnique({
    where: { id: bridgeId },
    select: {
      id: true,
      conversationId: true,
      status: true,
      chatTranscript: true,
      triageResult: true,
      summary: true,
    },
  });
  if (!bridge) return null;
  if (bridge.conversationId !== conversationId) return null;
  return bridge;
}

/**
 * Mark bridge as completed (after Agent C summarises). Non-destructive:
 * only writes summary + triageResult + status. Never touches initial Q/A.
 */
export async function finalizeBridge(
  bridgeId: string,
  data: { summary: string; triageResult: object }
) {
  return db.donnaBridge.update({
    where: { id: bridgeId },
    data: {
      summary: data.summary,
      triageResult: data.triageResult as object,
      status: 'COMPLETED',
    },
  });
}

/**
 * Mark bridge as expired.
 */
export async function expireBridge(bridgeId: string) {
  return db.donnaBridge.update({
    where: { id: bridgeId },
    data: { status: 'EXPIRED' },
  });
}

/**
 * Mark bridge as completed when client finishes intake (donna-chat done=true).
 * Writes optional client metadata collected during chat.
 */
export async function completeBridgeOnIntake(
  bridgeId: string,
  meta?: {
    clientName?: string | null;
    clientEmail?: string | null;
    clientPhone?: string | null;
    practiceArea?: string | null;
  }
) {
  return db.donnaBridge.update({
    where: { id: bridgeId },
    data: {
      status: 'COMPLETED',
      ...(meta?.clientName   && { clientName:   meta.clientName }),
      ...(meta?.clientEmail  && { clientEmail:  meta.clientEmail }),
      ...(meta?.clientPhone  && { clientPhone:  meta.clientPhone }),
      ...(meta?.practiceArea && { practiceArea: meta.practiceArea }),
    },
  });
}

/**
 * Auto-expire stale ACTIVE bridges for a profile. Two rules:
 *  • No chat started  → expire after 3 days  (createdAt)
 *  • Chat started     → expire after 30 min of inactivity (updatedAt)
 * Called at fetch time — no cron needed.
 */
export async function autoExpireStale(profileId: string): Promise<number> {
  const threeDaysAgo   = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const thirtyMinAgo   = new Date(Date.now() - 30 * 60 * 1000);

  // Fetch all ACTIVE bridges for this profile (lightweight select)
  const activeBridges = await db.donnaBridge.findMany({
    where: { profileId, status: 'ACTIVE' },
    select: { id: true, chatTranscript: true, createdAt: true, updatedAt: true },
  });

  const toExpire: string[] = [];
  for (const b of activeBridges) {
    const transcript = Array.isArray(b.chatTranscript) ? b.chatTranscript : [];
    if (transcript.length === 0) {
      // Never touched by client — expire after 3 days
      if (b.createdAt < threeDaysAgo) toExpire.push(b.id);
    } else {
      // Client started chat — expire after 30 min of no new message
      if (b.updatedAt < thirtyMinAgo) toExpire.push(b.id);
    }
  }

  if (toExpire.length === 0) return 0;

  const result = await db.donnaBridge.updateMany({
    where: { id: { in: toExpire } },
    data: { status: 'EXPIRED' },
  });
  return result.count;
}

export type { DonnaBridge, BridgeStatus };
