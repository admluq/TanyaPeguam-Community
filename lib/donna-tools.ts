// lib/donna-tools.ts
// Tool definitions for Donna AI agents
// These tools allow Claude to access lawyer KB, triage rules, and case information

import type { DonnaToolDefinition } from './donna-types';

export const DONNA_TOOLS: Record<string, DonnaToolDefinition> = {
  // Agent A: Intake Tools
  get_lawyer_profile: {
    name: 'get_lawyer_profile',
    description:
      'Retrieve the lawyer\' profile information including firm name, practice areas, bio, and position. Use this to reference the lawyer\'s background during intake.',
    input_schema: {
      type: 'object',
      properties: {
        profile_id: {
          type: 'string',
          description: 'The lawyer profile ID from the database',
        },
      },
      required: ['profile_id'],
    },
  },

  get_lawyer_availability: {
    name: 'get_lawyer_availability',
    description:
      'Check the lawyer\'s current availability status and operating hours. Use this to set client expectations about response time.',
    input_schema: {
      type: 'object',
      properties: {
        profile_id: {
          type: 'string',
          description: 'The lawyer profile ID',
        },
      },
      required: ['profile_id'],
    },
  },

  // Agent B: Triage Tools
  get_practice_areas: {
    name: 'get_practice_areas',
    description:
      'Retrieve the list of practice areas the lawyer handles. Use this to determine if the client\' issue falls within their expertise.',
    input_schema: {
      type: 'object',
      properties: {
        profile_id: {
          type: 'string',
          description: 'The lawyer profile ID',
        },
      },
      required: ['profile_id'],
    },
  },

  get_deflect_patterns: {
    name: 'get_deflect_patterns',
    description:
      'Retrieve the list of keywords/patterns that should trigger automatic deflection. Use this to check if the case should be auto-rejected.',
    input_schema: {
      type: 'object',
      properties: {
        profile_id: {
          type: 'string',
          description: 'The lawyer profile ID',
        },
      },
      required: ['profile_id'],
    },
  },

  get_fee_structure: {
    name: 'get_fee_structure',
    description:
      'Retrieve fee information for consultation types (free, paid, emergency). Use this to assess affordability fit.',
    input_schema: {
      type: 'object',
      properties: {
        profile_id: {
          type: 'string',
          description: 'The lawyer profile ID',
        },
      },
      required: ['profile_id'],
    },
  },

  // Agent C & D: Recommendation Tools
  check_conflicts: {
    name: 'check_conflicts',
    description:
      'Check for potential conflicts of interest based on client name, opposing party, and case type. Returns conflict flags if any are found.',
    input_schema: {
      type: 'object',
      properties: {
        profile_id: {
          type: 'string',
          description: 'The lawyer profile ID',
        },
        client_name: {
          type: 'string',
          description: 'Name of the client seeking help',
        },
        opposing_party: {
          type: 'string',
          description: 'Name of opposing party or entity (if known)',
        },
      },
      required: ['profile_id', 'client_name'],
    },
  },

  get_lawyer_kb_context: {
    name: 'get_lawyer_kb_context',
    description:
      'Retrieve the lawyer\' knowledge base context including their expertise, experience, and practice notes. Use this for final assessment.',
    input_schema: {
      type: 'object',
      properties: {
        profile_id: {
          type: 'string',
          description: 'The lawyer profile ID',
        },
      },
      required: ['profile_id'],
    },
  },

  store_bridge_message: {
    name: 'store_bridge_message',
    description: 'Store a message in the DonnaBridge chat transcript. Internal tool for maintaining conversation history.',
    input_schema: {
      type: 'object',
      properties: {
        bridge_id: {
          type: 'string',
          description: 'The bridge session ID',
        },
        role: {
          type: 'string',
          enum: ['user', 'assistant', 'system'],
          description: 'Message sender role',
        },
        content: {
          type: 'string',
          description: 'Message content',
        },
        turn_index: {
          type: 'number',
          description: 'Sequential turn number in conversation',
        },
      },
      required: ['bridge_id', 'role', 'content', 'turn_index'],
    },
  },

  save_triage_result: {
    name: 'save_triage_result',
    description:
      'Save the triage result to the DonnaBridge for later reference. Agent B uses this to store its scoring output.',
    input_schema: {
      type: 'object',
      properties: {
        bridge_id: {
          type: 'string',
          description: 'The bridge session ID',
        },
        triage_result: {
          type: 'object',
          description: 'The full triage scoring result JSON',
        },
      },
      required: ['bridge_id', 'triage_result'],
    },
  },

  save_summary: {
    name: 'save_summary',
    description:
      'Save a human-readable summary of the intake conversation. Used by Agent C (summarizer) to document the case.',
    input_schema: {
      type: 'object',
      properties: {
        bridge_id: {
          type: 'string',
          description: 'The bridge session ID',
        },
        summary: {
          type: 'string',
          description: 'The summary text',
        },
      },
      required: ['bridge_id', 'summary'],
    },
  },
};

// Tool definitions specifically for Agent A (Intake)
export const INTAKE_AGENT_TOOLS = [
  DONNA_TOOLS.get_lawyer_profile,
  DONNA_TOOLS.get_lawyer_availability,
  DONNA_TOOLS.store_bridge_message,
];

// Tool definitions specifically for Agent B (Triage)
export const TRIAGE_AGENT_TOOLS = [
  DONNA_TOOLS.get_practice_areas,
  DONNA_TOOLS.get_deflect_patterns,
  DONNA_TOOLS.get_fee_structure,
  DONNA_TOOLS.save_triage_result,
];

// Tool definitions specifically for Agent C (Compliance)
export const COMPLIANCE_AGENT_TOOLS = [
  DONNA_TOOLS.get_practice_areas,
  DONNA_TOOLS.get_deflect_patterns,
  DONNA_TOOLS.check_conflicts,
  DONNA_TOOLS.save_summary,
];

// Tool definitions specifically for Agent D (Recommendation)
export const RECOMMENDATION_AGENT_TOOLS = [
  DONNA_TOOLS.get_lawyer_kb_context,
  DONNA_TOOLS.get_fee_structure,
];
