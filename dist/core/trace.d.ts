/**
 * Clearpath Audit Protocol (CAP-1.0) — trace construction and hash chaining.
 */
import type { TraceNode, NodeType, TraceBuilderState, CreateTraceOptions, DeriveOptions, DecideOptions } from "./types";
declare const GENESIS_PREVIOUS_HASH = "0";
declare function canonicalEncode(node: {
    previous_hash: string;
    type: string;
    content: string;
    evidence: string[];
    timestamp: string;
    agent_id: string;
    confidence: number | null;
    meta?: Record<string, unknown>;
}): string;
declare function computeHash(previousHash: string, type: NodeType, content: string, evidence: string[], timestamp: string, agentId: string, confidence: number | null, meta?: Record<string, unknown>): string;
export declare class TraceBuilder {
    private state;
    constructor(state: TraceBuilderState);
    get nodes(): TraceNode[];
    get boundaries(): import("./types").TrustBoundary[];
    get agentId(): string;
    get context(): string;
    get createdAt(): string;
    get schemaVersion(): "CAP-1.0";
    private get lastHash();
    private get idSet();
    private append;
    observe(content: string, options?: {
        confidence?: number;
    }): TraceNode;
    derive(content: string, options: DeriveOptions): TraceNode;
    assume(content: string, options?: {
        confidence?: number;
    }): TraceNode;
    decide(decisionText: string, options: DecideOptions): TraceNode;
    act(content: string, options?: {
        confidence?: number;
    }): TraceNode;
    setBoundary(name: string, options: {
        nodes: string[];
        description?: string;
    }): import("./types").TrustBoundary;
    getState(): TraceBuilderState;
}
export declare function createTrace(options: CreateTraceOptions): TraceBuilder;
export { computeHash, canonicalEncode, GENESIS_PREVIOUS_HASH };
//# sourceMappingURL=trace.d.ts.map