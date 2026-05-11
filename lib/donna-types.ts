// lib/donna-types.ts
// TypeScript types for Donna AI 4-agent pipeline

export type UrgencyTag = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ClientSophistication = 'LAYPERSON' | 'INFORMED' | 'SOPHISTICATED';
export type SuggestedTier = 'FREE_CONSULT' | 'PAID_CONSULT' | 'FULL_RETAINER';
export type ComplianceStatus = 'APPROVED' | 'APPROVED_WITH_WARNING' | 'REJECTED';
export type RecommendationType = 'ACCEPT' | 'REJECT' | 'DEFER';

// Agent A: Intake Output
export interface IntakeOutput {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  practiceArea?: string;
  issueSummary?: string;
  transcript: string;
  metadata: {
    duration: number;
    turnsCount: number;
    timestamp: string;
  };
}

// Agent B: Triage Output
export interface TriageOutput {
  concreteScore: number; // 0-100
  urgencyTag: UrgencyTag;
  sophistication: ClientSophistication;
  suggestedTier: SuggestedTier;
  shouldDeflect: boolean;
  deflectReason?: string;
  reasoning: {
    concrete: string;
    urgency: string;
    sophistication: string;
    tier: string;
    practice_fit: string;
  };
  keyStrengths: string[];
  risks: string[];
}

// Agent C: Compliance Output
export interface ComplianceOutput {
  complianceStatus: ComplianceStatus;
  overrideReason?: string;
  overrideTier?: SuggestedTier;
  deflectionRequired: boolean;
  deflectionReason?: string;
  conflictFlags: string[];
  scopeWarnings: string[];
  recommendations: string;
}

// Agent D: Recommendation Output
export interface RecommendationOutput {
  finalRecommendation: RecommendationType;
  tierRecommendation: SuggestedTier;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  nextSteps: string[];
  lawyerNotes: string;
  followUpTemplate: {
    subject: string;
    body: string;
  };
  estimatedValue: 'free_consult' | 'paid_consult' | 'full_retainer';
  handoffReady: boolean;
}

// Full Donna Pipeline Result
export interface DonnaPipelineResult {
  bridgeId: string;
  intake: IntakeOutput;
  triage: TriageOutput;
  compliance: ComplianceOutput;
  recommendation: RecommendationOutput;
  completedAt: string;
  totalProcessingTime: number; // milliseconds
}

// Donna Inquiry Model (stored in DB)
export interface DonnaInquiryData {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  practiceArea?: string;
  issueSummary?: string;
  transcript: string;
  concreteScore: number;
  urgencyTag: UrgencyTag;
  sophistication: ClientSophistication;
  suggestedTier: SuggestedTier;
  deflected: boolean;
  status: 'PENDING' | 'EMAILED' | 'ACCEPTED' | 'REJECTED' | 'DEFLECTED';
}

// Tool use for accessing lawyer knowledge base
export interface LawyerKnowledgeBase {
  firmName?: string;
  bio?: string;
  practiceAreas: string[];
  position?: string;
  availability?: string;
  fees?: {
    consultationFree?: boolean;
    consultationRate?: number;
    emergencyRate?: number;
    videoRate?: number;
  };
}

// Triage rules from DonnaConfig
export interface TriageRules {
  practiceAreas: string[];
  deflectPatterns: string[];
  personality: 'PROFESSIONAL' | 'SOFT' | 'STRICT';
}

// Bridge session for multi-turn conversation
export interface BridgeSession {
  id: string;
  shortCode: string;
  profileId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'ESCALATED';
  chatTranscript: BridgeMessage[];
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  practiceArea?: string;
  triageResult?: TriageOutput;
  createdAt: string;
  updatedAt: string;
}

// Individual chat message in bridge session
export interface BridgeMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  turnIndex: number;
  toolCalls?: Array<{
    name: string;
    input: Record<string, unknown>;
  }>;
}

// Tool definitions for agent use
export interface DonnaToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

// API request/response types
export interface DonnaIntakeRequest {
  message: string;
  bridgeId?: string;
  profileId: string;
}

export interface DonnaIntakeResponse {
  success: boolean;
  bridgeId: string;
  message: string;
  timestamp: string;
}

export interface DonnaTriageRequest {
  intakeTranscript: string;
  lawyerKB: LawyerKnowledgeBase;
  triageRules: TriageRules;
}

export interface DonnaTriageResponse {
  triage: TriageOutput;
  timestamp: string;
}

// Configuration from database
export interface DonnaConfigData {
  kbContext?: string;
  personality: 'PROFESSIONAL' | 'SOFT' | 'STRICT';
  triageRules: {
    practiceAreas: string[];
    deflectPatterns: string[];
  };
}
