import { auth } from '@/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/bridge/create
 * Create a new bridge session from Facebook lead/question + lawyer advice
 *
 * Body:
 *   question   string   — the Facebook question or client inquiry
 *   answer     string   — the lawyer's initial advice/response
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch lawyer's profile
    const profile = await db.lawyerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'LawyerProfile not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { question, answer } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'question is required and must be a string' },
        { status: 400 }
      );
    }

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json(
        { error: 'answer is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate unique 8-character shortCode
    const shortCode = nanoid(8);

    // Store both question and answer in transcript as JSON structure
    const transcript = JSON.stringify({
      question,
      answer,
      createdBy: 'lawyer', // Indicates this was created by lawyer (not from widget)
    });

    // Create bridge session atomically
    const bridge = await db.donnaBridge.create({
      data: {
        profileId: profile.id,
        shortCode,
        status: 'ACTIVE',
        transcript, // Store both question and answer as JSON
      },
    });

    return NextResponse.json({
      success: true,
      bridgeId: bridge.id,
      shortCode: bridge.shortCode,
    });
  } catch (error) {
    console.error('Bridge creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create bridge' },
      { status: 500 }
    );
  }
}
