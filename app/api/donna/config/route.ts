import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await db.donnaConfig.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = session.user.id;

  const config = await db.donnaConfig.upsert({
    where: { userId },
    update: {
      practiceAreas: body.practiceAreas ?? [],
      jurisdiction: body.jurisdiction,
      barCouncil: Array.isArray(body.barCouncil) ? body.barCouncil[0] : body.barCouncil,
      workingHours: body.hoursPreset !== undefined ? body.hoursPreset : undefined,
      firstConsultMode: body.firstConsultMode,
      consultFee: body.consultFee ? parseFloat(body.consultFee) : null,
      urgencyFee: body.urgencyFee ? parseFloat(body.urgencyFee) : null,
      sensitivityLevel: body.sensitivityLevel ?? 5,
      deflectPatterns: body.deflectPatterns ?? [],
      emailTo: body.emailTo,
      lowTierLabel: body.lowTierLabel,
      medTierLabel: body.medTierLabel,
      highTierLabel: body.highTierLabel,
      isComplete: body.isComplete ?? false,
    },
    create: {
      userId,
      practiceAreas: body.practiceAreas ?? [],
      jurisdiction: body.jurisdiction,
      barCouncil: Array.isArray(body.barCouncil) ? body.barCouncil[0] : body.barCouncil,
      firstConsultMode: body.firstConsultMode,
      consultFee: body.consultFee ? parseFloat(body.consultFee) : null,
      urgencyFee: body.urgencyFee ? parseFloat(body.urgencyFee) : null,
      sensitivityLevel: body.sensitivityLevel ?? 5,
      deflectPatterns: body.deflectPatterns ?? [],
      emailTo: body.emailTo,
      lowTierLabel: body.lowTierLabel ?? 'Konsultasi (RM50)',
      medTierLabel: body.medTierLabel ?? 'Web Call',
      highTierLabel: body.highTierLabel ?? 'Temujanji',
      isComplete: body.isComplete ?? false,
    },
  });

  return NextResponse.json(config);
}
