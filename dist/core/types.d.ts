/**
 * Clearpath Audit Protocol (CAP-1.1) — core type definitions.
 */
export type NodeType = "OBSERVE" | "DERIVE" | "ASSUME" | "DECIDE" | "ACT";
export type SchemaVersion = "CAP-1.0" | "CAP-1.1";
export type FaithfulnessState = "verified_faithful" | "narrative" | "unverified" | "disputed";
export declare const NODE_TYPES: NodeType[];
export interface TraceNode {
    id: string;
    type: NodeType;
    content: string;
    evidence: string[];
    faithfulness?: FaithfulnessState;
    timestamp: string;
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
    schema_version: SchemaVersion;
    created_at: string;
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
    schemaVersion: SchemaVersion;
    readOnly?: boolean;
}
export interface CreateTraceOptions {
    agentId: string;
    context: string;
}
export interface DeriveOptions {
    evidence: string[];
    confidence?: number;
    faithfulness?: FaithfulnessState;
}
export interface DecideOptions {
    alternatives: string[];
    reasoning: string;
    evidence?: string[];
    confidence?: number;
    faithfulness?: FaithfulnessState;
}
export interface NodeOptions {
    confidence?: number;
    faithfulness?: FaithfulnessState;
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
    schema_version: SchemaVersion;
    agent_id: string;
    context: string;
    created_at: string;
    nodes: TraceNode[];
    trust_boundaries: TrustBoundary[];
}
export interface FaithfulnessReport {
    total: number;
    verified_faithful: number;
    narrative: number;
    unverified: number;
    disputed: number;
}
//# sourceMappingURL=types.d.ts.map