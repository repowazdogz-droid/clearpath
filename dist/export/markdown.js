"use strict";
/**
 * Clearpath Audit Protocol (CAP-1.0) — human-readable markdown export.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMarkdown = exportMarkdown;
const verify_1 = require("../core/verify");
function timePart(iso) {
    try {
        const d = new Date(iso);
        return d.toISOString().replace("Z", "").slice(11, 19);
    }
    catch {
        return iso;
    }
}
function boundaryNameForNode(nodeId, boundaries) {
    for (const b of boundaries) {
        if (b.nodes.includes(nodeId))
            return b.name;
    }
    return "";
}
/**
 * Export trace as human-readable markdown audit trail.
 */
function exportMarkdown(trace) {
    const nodes = trace.nodes;
    const boundaries = trace.boundaries;
    const context = trace.context;
    const agentId = trace.agentId;
    const createdAt = trace.createdAt;
    const result = (0, verify_1.verifyTrace)({ nodes, boundaries });
    const verificationLine = result.valid ? "✅ Valid" : "❌ Invalid";
    const lines = [
        `# Decision Trace: ${context}`,
        `**Agent:** ${agentId}`,
        `**Created:** ${createdAt}`,
        `**Schema:** CAP-1.0`,
        `**Verification:** ${verificationLine}`,
        "",
        "## Trace",
        "",
    ];
    for (const node of nodes) {
        const tb = boundaryNameForNode(node.id, boundaries);
        lines.push(`### [${node.type}] ${timePart(node.timestamp)}`);
        if (node.type === "DECIDE") {
            lines.push(`**Decision:** ${node.content}`);
            if (node.meta) {
                const m = node.meta;
                if (m.alternatives && m.alternatives.length) {
                    lines.push(`**Alternatives considered:** ${m.alternatives.join(", ")}`);
                }
                if (m.reasoning) {
                    lines.push(`**Reasoning:** ${m.reasoning}`);
                }
            }
        }
        else {
            lines.push(node.content);
        }
        if (node.evidence.length > 0) {
            lines.push(`*Evidence: ${node.evidence.join(", ")}*`);
        }
        if (tb) {
            lines.push(`*Trust boundary: ${tb}*`);
        }
        lines.push("");
    }
    return lines.join("\n");
}
//# sourceMappingURL=markdown.js.map