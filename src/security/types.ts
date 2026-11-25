export const moduleIds = [
  "linkguard",
  "messageguard",
  "siteguard",
  "payguard",
  "identityguard",
] as const;

export type ModuleId = (typeof moduleIds)[number];
export type RiskLevel = "low" | "medium" | "high" | "critical" | "inconclusive";
export type Confidence = "low" | "medium" | "high";
export type EvidenceSeverity = "info" | "low" | "medium" | "high";

export interface InvestigationInput {
  module: ModuleId;
  content: string;
}

export interface Evidence {
  id: string;
  title: string;
  detail: string;
  severity: EvidenceSeverity;
}

export interface InvestigationResult {
  investigationId: string;
  module: ModuleId;
  riskLevel: RiskLevel;
  riskScore: number;
  confidence: Confidence;
  summary: string;
  evidence: Evidence[];
  recommendations: string[];
  limitations: string[];
  analyzedAt: string;
}

export interface ModelExplanation {
  summary: string;
  recommendations: string[];
  uncertainties: string[];
}

export type InferenceSource = "on_device" | "in_cloud";

export interface AIAnalysis {
  explanation: ModelExplanation;
  inferenceSource: InferenceSource;
  durationMs: number;
}
