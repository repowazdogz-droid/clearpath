/**
 * Clearpath Audit Protocol (CAP-1.0) — human-readable markdown export.
 */
import type { TraceNode, TrustBoundary } from "../core/types";
import type { TraceBuilder } from "../core/trace";
export type TraceLike = TraceBuilder | {
    nodes: TraceNode[];
    boundaries: TrustBoundary[];
    context: string;
    agentId: string;
    createdAt: string;
};
/**
 * Export trace as human-readable markdown audit trail.
 */
export declare function exportMarkdown(trace: TraceLike): string;
//# sourceMappingURL=markdown.d.ts.map