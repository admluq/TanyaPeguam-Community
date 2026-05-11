// lib/donna-simple.ts
// Lean MVP: 5-question intake flow
// Context (3) + Detail Refine (2)

const QUESTIONS = [
  // Context (3)
  "What's your legal issue about? (Please describe briefly)",
  "When did this start or happen?",
  "Who else is involved in this matter?",

  // Detail Refine (2)
  "What's your main concern right now?",
  "What outcome are you hoping for?",
];

/**
 * Get the next question based on turn count
 * Turn count = number of user messages
 */
export function getNextQuestion(turnCount: number): string {
  if (turnCount >= QUESTIONS.length) {
    return "Thank you for providing all that information. A lawyer from our firm will review your case and contact you soon.";
  }
  return QUESTIONS[turnCount];
}

/**
 * Check if the 5-question intake is complete
 */
export function isIntakeComplete(turnCount: number): boolean {
  return turnCount >= QUESTIONS.length;
}

/**
 * Format intake transcript for email
 */
export function formatIntakeForEmail(
  transcript: Array<{ role: string; content: string }>
): string {
  let formatted = "INTAKE INFORMATION\n";
  formatted += "==================\n\n";

  let qIndex = 0;
  for (const msg of transcript) {
    if (msg.role === "user" && qIndex < QUESTIONS.length) {
      formatted += `Q${qIndex + 1}: ${QUESTIONS[qIndex]}\n`;
      formatted += `A: ${msg.content}\n\n`;
      qIndex++;
    }
  }

  return formatted;
}

/**
 * Extract key info from transcript for email subject/preview
 */
export function extractKeyInfo(
  transcript: Array<{ role: string; content: string }>
): { issue: string; urgency: string } {
  const userMessages = transcript.filter((m) => m.role === "user");

  return {
    issue: userMessages[0]?.content || "Legal inquiry",
    urgency: userMessages[1]?.content?.includes("urgent")
      ? "URGENT"
      : "NORMAL",
  };
}
