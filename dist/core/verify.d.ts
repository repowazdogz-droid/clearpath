/**
 * Clearpath Audit Protocol (CAP-1.0) — hash chain and structural verification.
 */
import type { TraceNode, TrustBoundary, VerifyResult } from "./types";
export type TraceLike = {
    nodes: TraceNode[];
    boundaries: TrustBoundary[];
};
/**
 * Verifies hash chain integrity, evidence references, and trust boundary coverage.
 * Returns the first node where the chain breaks, if any.
 */
export declare function verifyTrace(trace: TraceLike): VerifyResult;
//# sourceMappingURL=verify.d.ts.map