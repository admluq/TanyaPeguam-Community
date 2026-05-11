// lib/donna-service.ts
// Main Donna AI service for orchestrating the 4-agent pipeline
// Coordinates: Intake (A) → Triage (B) → Compliance (C) → Recommendation (D)

import { client } from './anthropic';
import {
  DONNA_CONFIG,
  DONNA_SYSTEM_PROMPTS,
  DONNA_PERSONALITIES,
} from './donna-constants';
import {
  INTAKE_AGENT_TOOLS,
  TRIAGE_AGENT_TOOLS,
  COMPLIANCE_AGENT_TOOLS,
  RECOMMENDATION_AGENT_TOOLS,
} from './donna-tools';
import {
  extractJsonFromResponse,
  validateTriageOutput,
  validateComplianceOutput,
  validateRecommendationOutput,
} from './donna-utils';
import type {
  IntakeOutput,
  TriageOutput,
  ComplianceOutput,
  RecommendationOutput,
  DonnaPipelineResult,
  LawyerKnowledgeBase,
  TriageRules,
} from './donna-types';

/**
 * Agent A: Intake Agent
 * Conducts warm, professional intake conversation
 * Gathers client info and issue details
 */
export async function runIntakeAgent(
  clientMessage: string,
  lawyerProfile: LawyerKnowledgeBase & { personality?: string },
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const personality =
    (lawyerProfile.personality as keyof typeof DONNA_PERSONALITIES) ||
    'PROFESSIONAL';
  const personalityConfig = DONNA_PERSONALITIES[personality];

  const systemPrompt = `${DONNA_SYSTEM_PROMPTS.INTAKE}

## Lawyer Context:
Firm: ${lawyerProfile.firmName || 'TanyaPeguam'}
Specialty: ${lawyerProfile.practiceAreas?.join(', ') || 'General legal services'}
Position: ${lawyerProfile.position || 'Legal Professional'}

## Your Personality Style:
Tone: ${personalityConfig.tone}
Communication style: ${personalityConfig.style}

## Available Tools:
You can retrieve the lawyer's profile or check availability if needed to provide accurate information to the client.`;

  const response = await client.messages.create({
    model: DONNA_CONFIG.INTAKE.model,
    max_tokens: DONNA_CONFIG.INTAKE.max_tokens,
    thinking: DONNA_CONFIG.INTAKE.thinking,
    system: systemPrompt,
    tools: INTAKE_AGENT_TOOLS as unknown as Parameters<
      typeof client.messages.create
    >[0]['tools'],
    messages: [
      ...conversationHistory,
      {
        role: 'user',
        content: clientMessage,
      },
    ],
  });

  // Extract text response
  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from intake agent');
  }

  return textContent.text;
}

/**
 * Agent B: Triage Agent
 * Scores the case on concrete, urgency, sophistication, and tier
 * Checks for deflection triggers
 */
export async function runTriageAgent(
  intakeTranscript: string,
  lawyerKB: LawyerKnowledgeBase,
  triageRules: TriageRules
): Promise<TriageOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const systemPrompt = `${DONNA_SYSTEM_PROMPTS.TRIAGE}

## Lawyer Knowledge Base:
${lawyerKB.bio ? `Bio: ${lawyerKB.bio}` : ''}
Practice Areas: ${lawyerKB.practiceAreas?.join(', ') || 'Not specified'}
Position: ${lawyerKB.position || 'Not specified'}

## Triage Rules to Apply:
- Accepted Practice Areas: ${triageRules.practiceAreas.join(', ')}
- Auto-Deflect Keywords: ${triageRules.deflectPatterns.join(', ')}

Remember: Respond ONLY with valid JSON. No other text.`;

  const response = await client.messages.create({
    model: DONNA_CONFIG.TRIAGE.model,
    max_tokens: DONNA_CONFIG.TRIAGE.max_tokens,
    thinking: DONNA_CONFIG.TRIAGE.thinking,
    system: systemPrompt,
    tools: TRIAGE_AGENT_TOOLS as unknown as Parameters<
      typeof client.messages.create
    >[0]['tools'],
    messages: [
      {
        role: 'user',
        content: `Please triage this intake transcript:\n\n${intakeTranscript}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from triage agent');
  }

  const parsed = extractJsonFromResponse(textContent.text);

  if (!validateTriageOutput(parsed)) {
    throw new Error('Invalid triage output structure');
  }

  return parsed;
}

/**
 * Agent C: Compliance Agent
 * Validates triage against practice areas, deflect patterns, bar rules
 * Flags conflicts and scope issues
 */
export async function runComplianceAgent(
  intakeTranscript: string,
  triageOutput: TriageOutput,
  lawyerKB: LawyerKnowledgeBase,
  triageRules: TriageRules
): Promise<ComplianceOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const systemPrompt = `${DONNA_SYSTEM_PROMPTS.COMPLIANCE}

## Lawyer Rules:
- Practice Areas: ${lawyerKB.practiceAreas?.join(', ') || 'Not specified'}
- Auto-Deflect Keywords: ${triageRules.deflectPatterns.join(', ')}

## Triage Output to Review:
${JSON.stringify(triageOutput, null, 2)}

Remember: Respond ONLY with valid JSON. No other text.`;

  const response = await client.messages.create({
    model: DONNA_CONFIG.COMPLIANCE.model,
    max_tokens: DONNA_CONFIG.COMPLIANCE.max_tokens,
    thinking: DONNA_CONFIG.COMPLIANCE.thinking,
    system: systemPrompt,
    tools: COMPLIANCE_AGENT_TOOLS as unknown as Parameters<
      typeof client.messages.create
    >[0]['tools'],
    messages: [
      {
        role: 'user',
        content: `Review this case for compliance:\n\nIntake Transcript:\n${intakeTranscript}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from compliance agent');
  }

  const parsed = extractJsonFromResponse(textContent.text);

  if (!validateComplianceOutput(parsed)) {
    throw new Error('Invalid compliance output structure');
  }

  return parsed;
}

/**
 * Agent D: Recommendation Agent
 * Final recommendation, tier, next steps, and follow-up template
 */
export async function runRecommendationAgent(
  intakeTranscript: string,
  triageOutput: TriageOutput,
  complianceOutput: ComplianceOutput,
  lawyerKB: LawyerKnowledgeBase
): Promise<RecommendationOutput> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const systemPrompt = `${DONNA_SYSTEM_PROMPTS.RECOMMENDATION}

## Lawyer Information:
Firm: ${lawyerKB.firmName || 'TanyaPeguam'}
Position: ${lawyerKB.position || 'Legal Professional'}

## Analysis Results:
Triage Score: ${triageOutput.concreteScore}/100
Urgency: ${triageOutput.urgencyTag}
Tier Suggestion: ${triageOutput.suggestedTier}
Compliance Status: ${complianceOutput.complianceStatus}

Remember: Respond ONLY with valid JSON. No other text.`;

  const response = await client.messages.create({
    model: DONNA_CONFIG.RECOMMENDATION.model,
    max_tokens: DONNA_CONFIG.RECOMMENDATION.max_tokens,
    thinking: DONNA_CONFIG.RECOMMENDATION.thinking,
    system: systemPrompt,
    tools: RECOMMENDATION_AGENT_TOOLS as unknown as Parameters<
      typeof client.messages.create
    >[0]['tools'],
    messages: [
      {
        role: 'user',
        content: `Based on this analysis, provide final recommendations:\n\nIntake:\n${intakeTranscript}\n\nTriage:\n${JSON.stringify(triageOutput, null, 2)}\n\nCompliance:\n${JSON.stringify(complianceOutput, null, 2)}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from recommendation agent');
  }

  const parsed = extractJsonFromResponse(textContent.text);

  if (!validateRecommendationOutput(parsed)) {
    throw new Error('Invalid recommendation output structure');
  }

  return parsed;
}

/**
 * Run the complete Donna AI pipeline
 * All 4 agents: Intake → Triage → Compliance → Recommendation
 */
export async function runDonnaPipeline(
  intakeTranscript: string,
  lawyerProfile: LawyerKnowledgeBase & { personality?: string },
  triageRules: TriageRules
): Promise<DonnaPipelineResult> {
  const startTime = Date.now();

  try {
    // Agent B: Triage
    const triage = await runTriageAgent(
      intakeTranscript,
      lawyerProfile,
      triageRules
    );

    // Agent C: Compliance
    const compliance = await runComplianceAgent(
      intakeTranscript,
      triage,
      lawyerProfile,
      triageRules
    );

    // Agent D: Recommendation
    const recommendation = await runRecommendationAgent(
      intakeTranscript,
      triage,
      compliance,
      lawyerProfile
    );

    const endTime = Date.now();

    return {
      bridgeId: '', // Will be set by caller
      intake: {
        clientName: undefined,
        clientEmail: undefined,
        clientPhone: undefined,
        practiceArea: undefined,
        issueSummary: undefined,
        transcript: intakeTranscript,
        metadata: {
          duration: Math.floor((endTime - startTime) / 1000),
          turnsCount: intakeTranscript.split('\n').length,
          timestamp: new Date().toISOString(),
        },
      },
      triage,
      compliance,
      recommendation,
      completedAt: new Date().toISOString(),
      totalProcessingTime: endTime - startTime,
    };
  } catch (error) {
    throw new Error(
      `Donna pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
