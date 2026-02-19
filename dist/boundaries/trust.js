"use strict";
/**
 * Clearpath Audit Protocol (CAP-1.0) — trust boundary creation and validation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrustBoundary = createTrustBoundary;
exports.validateBoundaryCoverage = validateBoundaryCoverage;
const crypto_1 = require("crypto");
function createTrustBoundary(input) {
    return {
        id: (0, crypto_1.randomUUID)(),
        name: input.name,
        description: input.description,
        nodes: [...input.nodes],
    };
}
/**
 * Validates that every node in nodeIds belongs to exactly one trust boundary,
 * and that boundaries fully cover all nodes with no overlap.
 */
function validateBoundaryCoverage(nodeIds, boundaries) {
    const nodeSet = new Set(nodeIds);
    const assigned = new Set();
    for (const b of boundaries) {
        for (const nid of b.nodes) {
            if (!nodeSet.has(nid)) {
                return { valid: false, error: `Boundary "${b.name}" references unknown node ${nid}` };
            }
            if (assigned.has(nid)) {
                return { valid: false, error: `Node ${nid} belongs to more than one trust boundary` };
            }
            assigned.add(nid);
        }
    }
    for (const nid of nodeIds) {
        if (!assigned.has(nid)) {
            return { valid: false, error: `Node ${nid} does not belong to any trust boundary` };
        }
    }
    return { valid: true };
}
//# sourceMappingURL=trust.js.map