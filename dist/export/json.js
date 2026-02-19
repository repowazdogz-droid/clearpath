"use strict";
/**
 * Clearpath Audit Protocol (CAP-1.0) — JSON export and import.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportJSON = exportJSON;
exports.importJSON = importJSON;
const trace_1 = require("../core/trace");
function getExportPayload(trace) {
    if ("schema_version" in trace && trace.schema_version === "CAP-1.0") {
        return trace;
    }
    const t = trace;
    return {
        schema_version: "CAP-1.0",
        agent_id: t.agentId,
        context: t.context,
        created_at: t.createdAt,
        nodes: t.nodes,
        trust_boundaries: t.boundaries,
    };
}
/**
 * Export trace to JSON string. Deterministic: no pretty-print whitespace.
 */
function exportJSON(trace) {
    const payload = getExportPayload(trace);
    return JSON.stringify(payload);
}
/**
 * Import trace from JSON string. Validates schema, node order, and hashes presence.
 * Does NOT recompute hashes; verification does that separately.
 * Returns a read-only TraceBuilder (no appending).
 */
function importJSON(json) {
    const data = JSON.parse(json);
    if (typeof data !== "object" || data === null) {
        throw new Error("Invalid JSON: expected object");
    }
    const o = data;
    if (o.schema_version !== "CAP-1.0") {
        throw new Error(`Invalid schema_version: expected "CAP-1.0", got ${String(o.schema_version)}`);
    }
    const nodes = o.nodes;
    if (!Array.isArray(nodes)) {
        throw new Error("Missing or invalid nodes array");
    }
    const trust_boundaries = o.trust_boundaries;
    if (!Array.isArray(trust_boundaries)) {
        throw new Error("Missing or invalid trust_boundaries array");
    }
    const agent_id = o.agent_id;
    const context = o.context;
    const created_at = o.created_at;
    if (typeof agent_id !== "string")
        throw new Error("Missing or invalid agent_id");
    if (typeof context !== "string")
        throw new Error("Missing or invalid context");
    if (typeof created_at !== "string")
        throw new Error("Missing or invalid created_at");
    const traceNodes = nodes;
    for (let i = 0; i < traceNodes.length; i++) {
        const n = traceNodes[i];
        if (!n || typeof n.hash !== "string") {
            throw new Error(`Node at index ${i} missing hash`);
        }
        if (i > 0) {
            const prev = traceNodes[i - 1];
            if (prev.timestamp > n.timestamp) {
                throw new Error("Nodes must be ordered by timestamp");
            }
        }
    }
    return new trace_1.TraceBuilder({
        nodes: traceNodes,
        boundaries: trust_boundaries,
        agentId: agent_id,
        context,
        createdAt: created_at,
        schemaVersion: "CAP-1.0",
        readOnly: true,
    });
}
//# sourceMappingURL=json.js.map