"use strict";
/**
 * Clearpath Audit Protocol (CAP-1.0) — decision record creation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecord = createRecord;
const crypto_1 = require("crypto");
const verify_1 = require("./verify");
function createRecord(trace, options = {}) {
    const nodes = trace.nodes;
    const boundaries = trace.boundaries;
    const agentId = trace.agentId;
    const context = trace.context;
    const createdAt = trace.createdAt ?? new Date().toISOString();
    const result = (0, verify_1.verifyTrace)({ nodes, boundaries });
    const verification_status = result.valid
        ? "verified"
        : "tampered";
    return {
        id: (0, crypto_1.randomUUID)(),
        trace: [...nodes],
        trust_boundaries: [...boundaries],
        schema_version: "CAP-1.0",
        created_at: createdAt,
        agent_id: agentId,
        context,
        outcome: options.outcome ?? null,
        verification_status,
    };
}
//# sourceMappingURL=record.js.map