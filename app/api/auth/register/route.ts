import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(6).max(200),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Maklumat tidak sah. Sila semak semula.' },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const name = parsed.data.name.trim();
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const existing = await db.user.findUnique({ where: { email } });

    if (existing?.passwordHash) {
      return NextResponse.json({ error: 'E-mel ini sudah didaftarkan.' }, { status: 409 });
    }

    if (existing) {
      await db.user.update({
        where: { email },
        data: { name: existing.name ?? name, passwordHash },
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    await db.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[auth/register] failed', err);
    return NextResponse.json({ error: 'Ralat pelayan. Cuba lagi.' }, { status: 500 });
  }
}

