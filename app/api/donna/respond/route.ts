import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const action = req.nextUrl.searchParams.get('action');

  if (!token || !['accept', 'reject'].includes(action ?? '')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  const inquiry = action === 'accept'
    ? await db.donnaInquiry.findUnique({ where: { acceptToken: token } })
    : await db.donnaInquiry.findUnique({ where: { rejectToken: token } });

  if (!inquiry) return NextResponse.redirect(new URL('/dashboard', req.nextUrl));

  const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

  await db.donnaInquiry.update({
    where: { id: inquiry.id },
    data: { status: newStatus },
  });

  // Redirect to a simple confirmation page
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanyapeguam.com';
  const url = new URL('/api/donna/respond/done', baseUrl);
  url.searchParams.set('action', action!);
  url.searchParams.set('name', inquiry.callerName ?? '');
  return NextResponse.redirect(url);
}
