// lib/donna-handler.ts
// Tool execution handlers for Donna AI agents
// These functions are called when Claude uses tools

import { db } from './db';
import type {
  LawyerKnowledgeBase,
  TriageRules,
  DonnaToolDefinition,
} from './donna-types';

/**
 * Get lawyer profile information
 */
export async function getToolLawyerProfile(
  profileId: string
): Promise<LawyerKnowledgeBase> {
  try {
    const profile = await db.lawyerProfile.findUnique({
      where: { id: profileId },
      include: {
        donnaConfig: true,
        legalServiceConfig: true,
      },
    });

    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    return {
      firmName: profile.firmName || undefined,
      bio: profile.bio || undefined,
      position: profile.position || undefined,
      practiceAreas: [], // Will be populated from donnaConfig
    };
  } catch (error) {
    throw new Error(
      `Failed to get lawyer profile: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get lawyer's availability status
 */
export async function getToolLawyerAvailability(
  profileId: string
): Promise<{
  status: string;
  operatingHours: string;
  operatingState: string;
}> {
  try {
    const profile = await db.lawyerProfile.findUnique({
      where: { id: profileId },
      include: { legalServiceConfig: true },
    });

    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    return {
      status: profile.status,
      operatingHours:
        profile.legalServiceConfig?.waktuOperasi || 'Isnin-Jumaat 9-5',
      operatingState: profile.legalServiceConfig?.negeriOperasi || 'Not set',
    };
  } catch (error) {
    throw new Error(
      `Failed to get lawyer availability: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get lawyer's practice areas
 */
export async function getToolPracticeAreas(
  profileId: string
): Promise<string[]> {
  try {
    const config = await db.donnaConfig.findUnique({
      where: { profileId },
    });

    if (!config || !config.triageRules) {
      return [];
    }

    const rules = config.triageRules as unknown as TriageRules;
    return rules.practiceAreas || [];
  } catch (error) {
    throw new Error(
      `Failed to get practice areas: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get lawyer's deflect patterns
 */
export async function getToolDeflectPatterns(
  profileId: string
): Promise<string[]> {
  try {
    const config = await db.donnaConfig.findUnique({
      where: { profileId },
    });

    if (!config || !config.triageRules) {
      return [];
    }

    const rules = config.triageRules as unknown as TriageRules;
    return rules.deflectPatterns || [];
  } catch (error) {
    throw new Error(
      `Failed to get deflect patterns: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get lawyer's fee structure
 */
export async function getToolFeeStructure(profileId: string): Promise<{
  consultationMode: string;
  consultationFee?: number;
  emergencyFee?: number;
  videoFee?: number;
}> {
  try {
    const config = await db.legalServiceConfig.findUnique({
      where: { profileId },
    });

    if (!config) {
      return { consultationMode: 'PERCUMA' };
    }

    return {
      consultationMode: config.modKonsultasi,
      consultationFee: config.yuranKonsultasi || undefined,
      emergencyFee: config.yuranKecemasan || undefined,
      videoFee: config.yuranVideoMeeting || undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to get fee structure: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Check for conflicts of interest
 */
export async function getToolCheckConflicts(
  profileId: string,
  clientName: string,
  opposingParty?: string
): Promise<{
  conflictFound: boolean;
  flags: string[];
}> {
  try {
    // In production, would check against:
    // - Previous clients in same matter
    // - Opposing parties in recent cases
    // - Related parties
    // For now, basic check

    const flags: string[] = [];

    // Would query past inquiries/cases here
    // const recentCases = await db.donnaInquiry.findMany({
    //   where: { profileId, createdAt: { gte: 90 days ago } }
    // });

    return {
      conflictFound: flags.length > 0,
      flags,
    };
  } catch (error) {
    throw new Error(
      `Failed to check conflicts: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Get lawyer's knowledge base context
 */
export async function getToolLawyerKBContext(profileId: string): Promise<{
  kbContext: string;
  personality: string;
}> {
  try {
    const config = await db.donnaConfig.findUnique({
      where: { profileId },
    });

    const profile = await db.lawyerProfile.findUnique({
      where: { id: profileId },
    });

    if (!config || !profile) {
      throw new Error('Config or profile not found');
    }

    return {
      kbContext: config.kbContext || profile.bio || 'No context provided',
      personality: config.personality,
    };
  } catch (error) {
    throw new Error(
      `Failed to get KB context: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Store bridge message in chat transcript
 */
export async function storeToolBridgeMessage(
  bridgeId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  turnIndex: number
): Promise<{ success: boolean; message: string }> {
  try {
    const bridge = await db.donnaBridge.findUnique({
      where: { id: bridgeId },
    });

    if (!bridge) {
      throw new Error(`Bridge not found: ${bridgeId}`);
    }

    const currentTranscript = (bridge.chatTranscript as unknown as Array<{
      role: string;
      content: string;
      timestamp: string;
      turnIndex: number;
    }>) || [];

    const updatedTranscript = [
      ...currentTranscript,
      {
        role,
        content,
        timestamp: new Date().toISOString(),
        turnIndex,
      },
    ];

    await db.donnaBridge.update({
      where: { id: bridgeId },
      data: {
        chatTranscript: updatedTranscript as unknown as Record<
          string,
          unknown
        >,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: 'Message stored' };
  } catch (error) {
    throw new Error(
      `Failed to store bridge message: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Save triage result to bridge
 */
export async function saveToolTriageResult(
  bridgeId: string,
  triageResult: Record<string, unknown>
): Promise<{ success: boolean; message: string }> {
  try {
    await db.donnaBridge.update({
      where: { id: bridgeId },
      data: {
        triageResult: triageResult as Record<string, unknown>,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: 'Triage result saved' };
  } catch (error) {
    throw new Error(
      `Failed to save triage result: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Save conversation summary
 */
export async function saveToolSummary(
  bridgeId: string,
  summary: string
): Promise<{ success: boolean; message: string }> {
  try {
    await db.donnaBridge.update({
      where: { id: bridgeId },
      data: {
        summary,
        updatedAt: new Date(),
      },
    });

    return { success: true, message: 'Summary saved' };
  } catch (error) {
    throw new Error(
      `Failed to save summary: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Main tool executor - routes tool calls to handlers
 */
export async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<unknown> {
  try {
    switch (toolName) {
      case 'get_lawyer_profile':
        return await getToolLawyerProfile(toolInput.profile_id as string);

      case 'get_lawyer_availability':
        return await getToolLawyerAvailability(toolInput.profile_id as string);

      case 'get_practice_areas':
        return await getToolPracticeAreas(toolInput.profile_id as string);

      case 'get_deflect_patterns':
        return await getToolDeflectPatterns(toolInput.profile_id as string);

      case 'get_fee_structure':
        return await getToolFeeStructure(toolInput.profile_id as string);

      case 'check_conflicts':
        return await getToolCheckConflicts(
          toolInput.profile_id as string,
          toolInput.client_name as string,
          toolInput.opposing_party as string | undefined
        );

      case 'get_lawyer_kb_context':
        return await getToolLawyerKBContext(toolInput.profile_id as string);

      case 'store_bridge_message':
        return await storeToolBridgeMessage(
          toolInput.bridge_id as string,
          toolInput.role as 'user' | 'assistant' | 'system',
          toolInput.content as string,
          toolInput.turn_index as number
        );

      case 'save_triage_result':
        return await saveToolTriageResult(
          toolInput.bridge_id as string,
          toolInput.triage_result as Record<string, unknown>
        );

      case 'save_summary':
        return await saveToolSummary(
          toolInput.bridge_id as string,
          toolInput.summary as string
        );

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    throw new Error(
      `Tool execution failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
