import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, e-mel, dan kata laluan diperlukan' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Kata laluan mesti sekurang-kurangnya 6 aksara' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'E-mel sudah didaftarkan' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ralat pendaftaran' },
      { status: 500 }
    );
  }
}
