import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'LawyerProfile not found. Create profile first.' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const config = await db.legalServiceConfig.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        negeriOperasi: body.negeriOperasi || null,
        badanPeguam: body.badanPeguam || [],
        waktuOperasi: body.waktuOperasi || 'isnin-jumaat-9-5',
        modKonsultasi: body.modKonsultasi || 'PERCUMA',
        yuranKonsultasi: body.yuranKonsultasi ? parseFloat(body.yuranKonsultasi) : null,
        yuranKecemasan: body.yuranKecemasan ? parseFloat(body.yuranKecemasan) : null,
        yuranVideoMeeting: body.yuranVideoMeeting ? parseFloat(body.yuranVideoMeeting) : null,
        yuranVideoMeetingKecemasan: body.yuranVideoMeetingKecemasan ? parseFloat(body.yuranVideoMeetingKecemasan) : null,
        yuranMeetingFizikal: body.yuranMeetingFizikal ? parseFloat(body.yuranMeetingFizikal) : null,
        yuranMeetingFizikalKecemasan: body.yuranMeetingFizikalKecemasan ? parseFloat(body.yuranMeetingFizikalKecemasan) : null,
        emelPertanyaan: body.emelPertanyaan || null,
        tierPerkhidmatan: body.tierPerkhidmatan || [],
      },
      update: {
        negeriOperasi: body.negeriOperasi || null,
        badanPeguam: body.badanPeguam || [],
        waktuOperasi: body.waktuOperasi || 'isnin-jumaat-9-5',
        modKonsultasi: body.modKonsultasi || 'PERCUMA',
        yuranKonsultasi: body.yuranKonsultasi ? parseFloat(body.yuranKonsultasi) : null,
        yuranKecemasan: body.yuranKecemasan ? parseFloat(body.yuranKecemasan) : null,
        yuranVideoMeeting: body.yuranVideoMeeting ? parseFloat(body.yuranVideoMeeting) : null,
        yuranVideoMeetingKecemasan: body.yuranVideoMeetingKecemasan ? parseFloat(body.yuranVideoMeetingKecemasan) : null,
        yuranMeetingFizikal: body.yuranMeetingFizikal ? parseFloat(body.yuranMeetingFizikal) : null,
        yuranMeetingFizikalKecemasan: body.yuranMeetingFizikalKecemasan ? parseFloat(body.yuranMeetingFizikalKecemasan) : null,
        emelPertanyaan: body.emelPertanyaan || null,
        tierPerkhidmatan: body.tierPerkhidmatan || [],
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('LegalServiceConfig upsert error:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'LawyerProfile not found' }, { status: 404 });
    }

    const config = await db.legalServiceConfig.findUnique({
      where: { profileId: profile.id },
    });

    return NextResponse.json({ success: true, config: config || null });
  } catch (error) {
    console.error('LegalServiceConfig fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}
