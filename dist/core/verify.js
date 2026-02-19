"use strict";
/**
 * Clearpath Audit Protocol (CAP-1.0) — hash chain and structural verification.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTrace = verifyTrace;
const trace_1 = require("./trace");
const trust_1 = require("../boundaries/trust");
/**
 * Verifies hash chain integrity, evidence references, and trust boundary coverage.
 * Returns the first node where the chain breaks, if any.
 */
function verifyTrace(trace) {
    const nodes = trace.nodes;
    const boundaries = trace.boundaries;
    if (nodes.length === 0) {
        const coverage = (0, trust_1.validateBoundaryCoverage)([], boundaries);
        if (!coverage.valid) {
            return { valid: false, error: coverage.error };
        }
        return { valid: true };
    }
    const nodeIds = new Set(nodes.map((n) => n.id));
    let previousHash = "0";
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.previous_hash !== previousHash) {
            return { valid: false, brokenAt: node.id, error: "previous_hash mismatch" };
        }
        const recomputed = (0, trace_1.computeHash)(node.previous_hash, node.type, node.content, node.evidence, node.timestamp, node.agent_id, node.confidence, node.meta);
        if (recomputed !== node.hash) {
            return { valid: false, brokenAt: node.id, error: "hash mismatch" };
        }
        previousHash = node.hash;
        for (const eid of node.evidence) {
            if (!nodeIds.has(eid)) {
                return {
                    valid: false,
                    brokenAt: node.id,
                    error: `Evidence ID "${eid}" not found in trace`,
                };
            }
            const evidenceIdx = nodes.findIndex((n) => n.id === eid);
            if (evidenceIdx >= i) {
                return {
                    valid: false,
                    brokenAt: node.id,
                    error: `Evidence ID "${eid}" must reference an earlier node`,
                };
            }
        }
    }
    const coverage = (0, trust_1.validateBoundaryCoverage)(nodes.map((n) => n.id), boundaries);
    if (!coverage.valid) {
        return { valid: false, error: coverage.error };
    }
    return { valid: true };
}
//# sourceMappingURL=verify.js.map