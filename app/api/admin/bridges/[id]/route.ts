// app/api/admin/bridges/[id]/route.ts
// DELETE — remove a bridge owned by the authenticated lawyer
// PATCH  — modify mutable bridge fields (status, client metadata)
//          NOTE: initialQuestion / initialAnswer are IMMUTABLE — enforced
//          by the Anti-Reset Lock in lib/db.ts. To "edit" those, delete
//          the bridge and create a new one.

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type Ctx = { params: Promise<{ id: string }> };

async function getOwnedBridge(bridgeId: string, userId: string) {
  return db.donnaBridge.findFirst({
    where: {
      id: bridgeId,
      profile: { userId },
    },
    select: { id: true, status: true },
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error('DELETE: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    console.log(`DELETE /api/admin/bridges/${id} by user ${session.user.id}`);

    const bridge = await getOwnedBridge(id, session.user.id);
    if (!bridge) {
      console.error(`DELETE: Bridge ${id} not found or not owned`);
      return NextResponse.json({ error: 'Bridge not found or not owned' }, { status: 404 });
    }

    console.log(`DELETE: Deleting bridge ${id}`);
    const result = await db.donnaBridge.delete({ where: { id } });
    console.log(`DELETE: Bridge ${id} deleted successfully`);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Bridge DELETE error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to delete bridge: ${msg}` },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const bridge = await getOwnedBridge(id, session.user.id);

    if (!bridge) {
      return NextResponse.json({ error: 'Bridge not found' }, { status: 404 });
    }

    const body = await req.json();

    // Whitelist mutable fields. NEVER allow initialQuestion / initialAnswer.
    const ALLOWED = [
      'status',
      'clientName',
      'clientEmail',
      'clientPhone',
      'practiceArea',
      'summary',
    ] as const;

    const data: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (key in body && body[key] !== undefined) {
        data[key] = body[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Status validation
    if (data.status && !['ACTIVE', 'COMPLETED', 'EXPIRED', 'DELETED', 'ESCALATED'].includes(data.status as string)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await db.donnaBridge.update({
      where: { id },
      data,
      select: {
        id: true,
        shortCode: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        practiceArea: true,
        summary: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, bridge: updated });
  } catch (error) {
    console.error('Bridge PATCH error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update bridge';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
