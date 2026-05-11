# Donna AI Setup Guide - Phase 3

This guide covers the complete setup and usage of the Donna AI 4-agent pipeline for TanyaPeguam.

## Files Created

### Core Files

1. **lib/anthropic.ts**
   - Anthropic SDK client singleton
   - Configured with prompt caching enabled
   - Initialize API key from `ANTHROPIC_API_KEY` env var
   - All agents use this shared client instance

2. **lib/donna-constants.ts**
   - System prompts for all 4 agents (Intake, Triage, Compliance, Recommendation)
   - Model configurations with adaptive thinking
   - Personality configurations (PROFESSIONAL, SOFT, STRICT)
   - Status constants for pipeline stages

3. **lib/donna-types.ts**
   - Complete TypeScript type definitions
   - Intake, Triage, Compliance, Recommendation output types
   - Bridge session and message types
   - API request/response types

4. **lib/donna-tools.ts**
   - Tool definitions for Claude to use
   - 10+ tools for accessing lawyer KB, practice areas, fees, etc.
   - Tool groupings by agent (Intake, Triage, Compliance, Recommendation)

5. **lib/donna-utils.ts**
   - Helper functions for JSON parsing, validation, formatting
   - Tool call parsing from Claude responses
   - Knowledge base context creation
   - Text truncation, phone formatting, etc.

6. **lib/donna-service.ts**
   - Main orchestration service
   - 4 agent runner functions (runIntakeAgent, runTriageAgent, etc.)
   - Full pipeline runner (runDonnaPipeline)
   - Error handling and validation

## Setup Steps

### Step 1: Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### Step 2: Add Environment Variables

Update your `.env.local`:

```
# Claude API Configuration
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**IMPORTANT:**
- Get your API key from https://console.anthropic.com/account/keys
- Make sure `.env.local` is in `.gitignore`
- Never commit API keys to git

### Step 3: Verify Installation

Create a test file at `lib/test-anthropic.ts`:

```typescript
import { client } from './anthropic';

export async function testConnection() {
  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 100,
    thinking: { type: 'adaptive' },
    messages: [
      {
        role: 'user',
        content: 'Say "Donna AI is ready" in one sentence.',
      },
    ],
  });

  console.log('✓ Anthropic client connected');
  const text = response.content.find((c) => c.type === 'text');
  if (text && text.type === 'text') {
    console.log('Response:', text.text);
  }
}
```

Run: `npx ts-node lib/test-anthropic.ts`

## Architecture Overview

### The 4-Agent Pipeline

```
┌─────────────────────────────────────────────────────────┐
│ CLIENT INTAKE CONVERSATION (Multi-turn, Agent A)        │
│ - Warm greeting                                         │
│ - Gather issue details                                  │
│ - Ask follow-up questions                               │
│ - Build rapport                                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ TRIAGE SCORING (Single-turn, Agent B)                   │
│ - Concrete Score (0-100)                                │
│ - Urgency Tag (LOW/MEDIUM/HIGH/CRITICAL)                │
│ - Sophistication Level                                  │
│ - Suggested Tier (FREE/PAID/RETAINER)                   │
│ - Deflection Check                                      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ COMPLIANCE CHECK (Single-turn, Agent C)                 │
│ - Practice area validation                              │
│ - Deflect pattern matching                              │
│ - Conflict of interest check                            │
│ - Bar rule compliance                                   │
│ - Approve/override/reject                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ RECOMMENDATION (Single-turn, Agent D)                   │
│ - Final accept/reject decision                          │
│ - Engagement tier                                       │
│ - Next steps for lawyer                                 │
│ - Client follow-up template                             │
└─────────────────────────────────────────────────────────┘
                          ↓
                    LAWYER DASHBOARD
           (Review & Send Magic Link to Client)
```

## Using the Service

### Basic Multi-Turn Intake

```typescript
import { runIntakeAgent } from '@/lib/donna-service';

// Example: First message from client
const clientMessage = "Hi, I need help with a tenant dispute";

const lawyerProfile = {
  firmName: "Arif Azmi & Co",
  position: "Senior Legal Advisor",
  practiceAreas: ["Harta Tanah", "Sivil Am"],
  bio: "Specializing in property disputes",
  personality: "PROFESSIONAL",
};

const response = await runIntakeAgent(
  clientMessage,
  lawyerProfile,
  [] // conversation history (empty for first message)
);

console.log(response);
// Output: "Good morning! I'm Donna with Arif Azmi & Co. I understand you're facing a tenant dispute..."
```

### Full Pipeline Scoring

```typescript
import { runDonnaPipeline } from '@/lib/donna-service';

const intakeTranscript = `
Client: I have a dispute with my tenant...
Agent: I understand. Can you tell me more about...
Client: He hasn't paid rent for 3 months...
Agent: How much does he owe...
`;

const result = await runDonnaPipeline(
  intakeTranscript,
  {
    firmName: "Arif Azmi & Co",
    practiceAreas: ["Harta Tanah", "Sivil Am"],
    personality: "PROFESSIONAL",
  },
  {
    practiceAreas: ["Harta Tanah", "Sivil Am"],
    deflectPatterns: ["criminal", "tax", "ip"],
    personality: "PROFESSIONAL",
  }
);

console.log("Concrete Score:", result.triage.concreteScore);
console.log("Urgency:", result.triage.urgencyTag);
console.log("Recommendation:", result.recommendation.finalRecommendation);
```

## Key Features

### Prompt Caching
- System prompts are cached for cost savings
- Prefix caching on stable lawyer context
- Automatic cost optimization

### Adaptive Thinking
- Claude 3.5 Opus decides when to reason deeply
- No fixed token budget needed
- Better accuracy for complex triage logic

### Type Safety
- Full TypeScript support
- Validated outputs from all agents
- Compile-time checks

### Error Handling
- Structured error messages
- Validation of agent outputs
- Graceful fallbacks

## Models

All agents use **Claude Opus 4.7**:
- 1M context window
- Adaptive thinking included
- Superior reasoning for legal triage
- Cost: $5/1M input, $25/1M output

## Next Steps

1. **Implement Intake Endpoint**: Create `/api/admin/donna-intake` route
2. **Build Bridge Manager UI**: Connect frontend to pipeline
3. **Add Tool Handlers**: Implement tool execution for lawyer KB access
4. **Deploy Pipeline**: Ready for production use

## Troubleshooting

### API Key Not Found
```
⚠️ ANTHROPIC_API_KEY not set. Donna AI features will not work.
```
→ Check `.env.local` has `ANTHROPIC_API_KEY=sk-ant-...`

### JSON Parse Error
```
Error: Could not parse JSON from response
```
→ Some responses may include markdown. Utils handle this automatically.

### Tool Not Found
```
TypeError: Tool not found
```
→ Ensure tools are passed to `client.messages.create()` with correct structure

## Cost Estimation

Per 1000 client intakes:
- Intake conversations: ~$15 (variable, 2-5 min convo)
- Triage scoring: ~$5
- Compliance check: ~$3
- Recommendation: ~$2
- **Total: ~$25/1000 = $0.025 per complete case**

With prompt caching: 10-20% additional savings on repeated lawyer context

## Support

For issues:
1. Check `.env.local` configuration
2. Verify API key is active at console.anthropic.com
3. Review response validation in donna-utils.ts
4. Check error logs from Claude API

---

**Ready for Phase 3!** You now have a complete foundation for the Donna AI intake pipeline. Next is implementing the API routes and integrating with the DonnaBridge model.
