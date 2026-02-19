/**
 * Clearpath Audit Protocol (CAP-1.0) — trust boundary creation and validation.
 */
import type { TrustBoundary } from "../core/types";
export interface CreateTrustBoundaryInput {
    name: string;
    description: string;
    nodes: string[];
}
export declare function createTrustBoundary(input: CreateTrustBoundaryInput): TrustBoundary;
/**
 * Validates that every node in nodeIds belongs to exactly one trust boundary,
 * and that boundaries fully cover all nodes with no overlap.
 */
export declare function validateBoundaryCoverage(nodeIds: string[], boundaries: TrustBoundary[]): {
    valid: boolean;
    error?: string;
};
//# sourceMappingURL=trust.d.ts.map