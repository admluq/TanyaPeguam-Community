// lib/donna-utils.ts
// Utility functions for Donna AI pipeline operations

import type { TriageOutput, ComplianceOutput, RecommendationOutput } from './donna-types';

/**
 * Extract JSON from Claude response that may contain markdown code blocks
 */
export function extractJsonFromResponse(text: string): Record<string, unknown> {
  try {
    // Try direct JSON parse first
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        throw new Error('Could not parse JSON from response');
      }
    }
    throw new Error('No valid JSON found in response');
  }
}

/**
 * Validate triage output has all required fields
 */
export function validateTriageOutput(output: unknown): output is TriageOutput {
  if (!output || typeof output !== 'object') return false;

  const data = output as Record<string, unknown>;
  return (
    typeof data.concreteScore === 'number' &&
    data.concreteScore >= 0 &&
    data.concreteScore <= 100 &&
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.urgencyTag as string) &&
    ['LAYPERSON', 'INFORMED', 'SOPHISTICATED'].includes(
      data.sophistication as string
    ) &&
    ['FREE_CONSULT', 'PAID_CONSULT', 'FULL_RETAINER'].includes(
      data.suggestedTier as string
    ) &&
    typeof data.shouldDeflect === 'boolean' &&
    typeof data.reasoning === 'object' &&
    Array.isArray(data.keyStrengths) &&
    Array.isArray(data.risks)
  );
}

/**
 * Validate compliance output has all required fields
 */
export function validateComplianceOutput(
  output: unknown
): output is ComplianceOutput {
  if (!output || typeof output !== 'object') return false;

  const data = output as Record<string, unknown>;
  return (
    ['APPROVED', 'APPROVED_WITH_WARNING', 'REJECTED'].includes(
      data.complianceStatus as string
    ) &&
    typeof data.deflectionRequired === 'boolean' &&
    Array.isArray(data.conflictFlags) &&
    Array.isArray(data.scopeWarnings) &&
    typeof data.recommendations === 'string'
  );
}

/**
 * Validate recommendation output has all required fields
 */
export function validateRecommendationOutput(
  output: unknown
): output is RecommendationOutput {
  if (!output || typeof output !== 'object') return false;

  const data = output as Record<string, unknown>;
  const followUp = data.followUpTemplate as Record<string, unknown>;

  return (
    ['ACCEPT', 'REJECT', 'DEFER'].includes(data.finalRecommendation as string) &&
    ['FREE_CONSULT', 'PAID_CONSULT', 'FULL_RETAINER'].includes(
      data.tierRecommendation as string
    ) &&
    ['LOW', 'MEDIUM', 'HIGH'].includes(data.priority as string) &&
    Array.isArray(data.nextSteps) &&
    typeof data.lawyerNotes === 'string' &&
    followUp &&
    typeof followUp.subject === 'string' &&
    typeof followUp.body === 'string' &&
    typeof data.handoffReady === 'boolean'
  );
}

/**
 * Check if any deflect pattern matches the transcript
 */
export function checkDeflectPatterns(
  transcript: string,
  patterns: string[]
): string | null {
  const lowerTranscript = transcript.toLowerCase();

  for (const pattern of patterns) {
    if (lowerTranscript.includes(pattern.toLowerCase())) {
      return pattern;
    }
  }

  return null;
}

/**
 * Check if practice area is in lawyer's list
 */
export function isPracticeAreaMatch(
  clientPracticeArea: string,
  lawyerPracticeAreas: string[]
): boolean {
  const normalized = clientPracticeArea.toLowerCase();
  return lawyerPracticeAreas.some((area) => area.toLowerCase() === normalized);
}

/**
 * Generate a short code for bridge session URLs
 */
export function generateBridgeShortCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTVWXYZabcdefghjkmnpqrstvwxyz0123456789';
  let code = '';

  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return 'N/A';

  // Remove non-digits
  const digits = phone.replace(/\D/g, '');

  // Format Malaysian numbers
  if (digits.startsWith('60')) {
    return `+${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  }

  return phone;
}

/**
 * Calculate conversation duration in seconds
 */
export function calculateDuration(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
}

/**
 * Truncate text to word count
 */
export function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Create lawyer knowledge base context string from profile data
 */
export function createKBContext(profile: {
  bio?: string;
  position?: string;
  firmName?: string;
  practiceAreas?: string[];
  kbContext?: string;
}): string {
  const parts = [];

  if (profile.kbContext) {
    parts.push(`Custom KB Context: ${profile.kbContext}`);
  }

  if (profile.position) {
    parts.push(`Position: ${profile.position}`);
  }

  if (profile.firmName) {
    parts.push(`Firm: ${profile.firmName}`);
  }

  if (profile.bio) {
    parts.push(`Bio: ${profile.bio}`);
  }

  if (profile.practiceAreas && profile.practiceAreas.length > 0) {
    parts.push(`Practice Areas: ${profile.practiceAreas.join(', ')}`);
  }

  return parts.join('\n');
}

/**
 * Safe JSON stringify with circular reference handling
 */
export function safeStringify(obj: unknown, space = 2): string {
  const seen = new WeakSet();

  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    },
    space
  );
}

/**
 * Parse tool call from Claude response
 */
export function parseToolCall(
  text: string
): Array<{ name: string; input: Record<string, unknown> }> {
  const toolCalls: Array<{ name: string; input: Record<string, unknown> }> = [];

  // Match <tool_use> blocks
  const toolUseRegex =
    /<tool_use[^>]*id="[^"]*"[^>]*name="([^"]*)"[^>]*>[\s\S]*?<input>([\s\S]*?)<\/input>[\s\S]*?<\/tool_use>/g;

  let match;
  while ((match = toolUseRegex.exec(text)) !== null) {
    const name = match[1];
    try {
      const input = JSON.parse(match[2]);
      toolCalls.push({ name, input });
    } catch {
      console.error(`Failed to parse tool input for ${name}`);
    }
  }

  return toolCalls;
}
