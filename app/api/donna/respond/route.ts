import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !action) {
      return NextResponse.json(
        { error: 'token dan action diperlukan' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action mesti accept atau reject' },
        { status: 400 }
      );
    }

    // Find inquiry by token
    let inquiry;
    if (action === 'accept') {
      inquiry = await db.donnaInquiry.findUnique({
        where: { acceptToken: token },
      });
    } else {
      inquiry = await db.donnaInquiry.findUnique({
        where: { rejectToken: token },
      });
    }

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Pautan tidak sah atau telah tamat tempoh' },
        { status: 404 }
      );
    }

    // Update status
    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    await db.donnaInquiry.update({
      where: { id: inquiry.id },
      data: { status: newStatus },
    });

    // Redirect to success page with message
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001';
    const message = action === 'accept' ? 'Pertanyaan ditandakan sebagai diterima' : 'Pertanyaan ditandakan sebagai ditolak';

    return NextResponse.redirect(
      `${baseUrl}/dashboard/donna/logs?message=${encodeURIComponent(message)}`,
      { status: 302 }
    );
  } catch (error) {
    console.error('Respond error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
