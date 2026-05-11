// app/api/admin/donna-triage/route.ts
// POST endpoint for running the complete 4-agent pipeline
// Takes a completed intake transcript, runs Triage → Compliance → Recommendation
// Returns final scores and recommendation

import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  runTriageAgent,
  runComplianceAgent,
  runRecommendationAgent,
} from '@/lib/donna-service';
import type {
  TriageRules,
  DonnaPipelineResult,
} from '@/lib/donna-types';

/**
 * POST /api/admin/donna-triage
 *
 * Request body:
 * {
 *   "bridgeId": "bridge-session-id",
 *   "transcript": "full intake conversation"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "triage": { concreteScore, urgencyTag, ... },
 *   "compliance": { complianceStatus, ... },
 *   "recommendation": { finalRecommendation, ... },
 *   "totalProcessingTime": 5000
 * }
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body = await request.json();
    const { bridgeId, transcript } = body as {
      bridgeId: string;
      transcript: string;
    };

    if (!bridgeId || !transcript) {
      return Response.json(
        { error: 'Missing bridgeId or transcript' },
        { status: 400 }
      );
    }

    // Get bridge and verify ownership
    const bridge = await db.donnaBridge.findUnique({
      where: { id: bridgeId },
      include: { profile: { include: { user: true, donnaConfig: true } } },
    });

    if (!bridge || bridge.profile.user.id !== session.user.id) {
      return Response.json(
        { error: 'Bridge not found or unauthorized' },
        { status: 403 }
      );
    }

    const profile = bridge.profile;
    const donnaConfig = profile.donnaConfig;

    if (!donnaConfig) {
      return Response.json(
        { error: 'Donna configuration not found' },
        { status: 400 }
      );
    }

    // Build lawyer profile context
    const lawyerProfile = {
      firmName: profile.firmName,
      position: profile.position,
      bio: profile.bio,
      practiceAreas: (
        (donnaConfig.triageRules as unknown as { practiceAreas?: string[] })
          ?.practiceAreas || []
      ) as string[],
      personality: donnaConfig.personality,
    };

    // Build triage rules
    const triageRules = (donnaConfig.triageRules as unknown as TriageRules) || {
      practiceAreas: [],
      deflectPatterns: [],
      personality: donnaConfig.personality,
    };

    // Run Agent B: Triage
    const triage = await runTriageAgent(
      transcript,
      lawyerProfile,
      triageRules
    );

    // Run Agent C: Compliance
    const compliance = await runComplianceAgent(
      transcript,
      triage,
      lawyerProfile,
      triageRules
    );

    // Run Agent D: Recommendation
    const recommendation = await runRecommendationAgent(
      transcript,
      triage,
      compliance,
      lawyerProfile
    );

    // Save triage result to bridge
    await db.donnaBridge.update({
      where: { id: bridgeId },
      data: {
        triageResult: triage as Record<string, unknown>,
        summary: recommendation.lawyerNotes,
        status: recommendation.finalRecommendation === 'ACCEPT' ? 'COMPLETED' : 'COMPLETED',
        updatedAt: new Date(),
      },
    });

    const endTime = Date.now();

    return Response.json({
      success: true,
      triage,
      compliance,
      recommendation,
      totalProcessingTime: endTime - startTime,
    });
  } catch (error) {
    console.error('Donna triage error:', error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/donna-triage?bridgeId=xxx
 * Retrieve cached triage result
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bridgeId = searchParams.get('bridgeId');

    if (!bridgeId) {
      return Response.json({ error: 'Missing bridgeId' }, { status: 400 });
    }

    const bridge = await db.donnaBridge.findUnique({
      where: { id: bridgeId },
      include: { profile: { include: { user: true } } },
    });

    if (!bridge || bridge.profile.user.id !== session.user.id) {
      return Response.json(
        { error: 'Bridge not found or unauthorized' },
        { status: 403 }
      );
    }

    if (!bridge.triageResult) {
      return Response.json(
        { error: 'Triage not completed for this bridge' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      triageResult: bridge.triageResult,
      summary: bridge.summary,
      completedAt: bridge.updatedAt,
    });
  } catch (error) {
    console.error('Donna GET triage error:', error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
