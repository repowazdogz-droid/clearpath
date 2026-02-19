/**
 * Clearpath Audit Protocol (CAP-1.0) — core type definitions.
 */

export type NodeType = "OBSERVE" | "DERIVE" | "ASSUME" | "DECIDE" | "ACT";

export const NODE_TYPES: NodeType[] = [
  "OBSERVE",
  "DERIVE",
  "ASSUME",
  "DECIDE",
  "ACT",
];

export interface TraceNode {
  id: string;
  type: NodeType;
  content: string;
  evidence: string[];
  timestamp: string; // ISO8601
  agent_id: string;
  confidence: number | null;
  meta?: Record<string, unknown>;
  hash: string;
  previous_hash: string;
}

export interface TrustBoundary {
  id: string;
  name: string;
  description: string;
  nodes: string[];
}

export type VerificationStatus = "unverified" | "verified" | "tampered";

export interface DecisionRecord {
  id: string;
  trace: TraceNode[];
  trust_boundaries: TrustBoundary[];
  schema_version: "CAP-1.0";
  created_at: string; // ISO8601
  agent_id: string;
  context: string;
  outcome: string | null;
  verification_status: VerificationStatus;
}

export interface TraceBuilderState {
  nodes: TraceNode[];
  boundaries: TrustBoundary[];
  agentId: string;
  context: string;
  createdAt: string;
  schemaVersion: "CAP-1.0";
  readOnly?: boolean;
}

export interface CreateTraceOptions {
  agentId: string;
  context: string;
}

export interface DeriveOptions {
  evidence: string[];
  confidence?: number;
}

export interface DecideOptions {
  alternatives: string[];
  reasoning: string;
  evidence?: string[];
  confidence?: number;
}

export interface SetBoundaryOptions {
  name: string;
  description?: string;
  nodes: string[];
}

export interface VerifyResult {
  valid: boolean;
  brokenAt?: string;
  error?: string;
}

export interface ExportedTrace {
  schema_version: "CAP-1.0";
  agent_id: string;
  context: string;
  created_at: string;
  nodes: TraceNode[];
  trust_boundaries: TrustBoundary[];
}
