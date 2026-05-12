// lib/anthropic.ts
// Anthropic SDK client singleton with prompt caching enabled
// For Phase 3: Donna AI 4-agent intake pipeline

import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️ ANTHROPIC_API_KEY not set. Donna AI features will not work.');
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export { client };
export default client;
