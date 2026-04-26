/**
 * Clearpath Audit Protocol (CAP-1.1) — hash chain, structure, and faithfulness summaries.
 */
import type { FaithfulnessReport, TraceNode, TrustBoundary, VerifyResult } from "./types";
export type TraceLike = {
    nodes: TraceNode[];
    boundaries: TrustBoundary[];
};
/**
 * Verifies hash chain integrity, evidence references, and trust boundary coverage.
 * Returns the first node where the chain breaks, if any.
 */
export declare function verifyTrace(trace: TraceLike): VerifyResult;
export declare function getFaithfulnessReport(trace: {
    nodes: TraceNode[];
}): FaithfulnessReport;
//# sourceMappingURL=verify.d.ts.map