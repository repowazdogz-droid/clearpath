"use strict";
/**
 * Clearpath Audit Protocol (CAP-1.0) — trace construction and hash chaining.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENESIS_PREVIOUS_HASH = exports.TraceBuilder = void 0;
exports.createTrace = createTrace;
exports.computeHash = computeHash;
exports.canonicalEncode = canonicalEncode;
const crypto_1 = require("crypto");
const types_1 = require("./types");
const trust_1 = require("../boundaries/trust");
const GENESIS_PREVIOUS_HASH = "0";
exports.GENESIS_PREVIOUS_HASH = GENESIS_PREVIOUS_HASH;
function canonicalEncode(node) {
    const evidenceStr = node.evidence.join("\n");
    const confidenceStr = node.confidence === null ? "" : String(node.confidence);
    const metaStr = node.meta === undefined
        ? ""
        : JSON.stringify(sortKeys(node.meta));
    return [
        node.previous_hash,
        node.type,
        node.content,
        evidenceStr,
        node.timestamp,
        node.agent_id,
        confidenceStr,
        metaStr,
    ].join("\n");
}
function sortKeys(obj) {
    const keys = Object.keys(obj).sort();
    const out = {};
    for (const k of keys) {
        const v = obj[k];
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
            out[k] = sortKeys(v);
        }
        else {
            out[k] = v;
        }
    }
    return out;
}
function computeHash(previousHash, type, content, evidence, timestamp, agentId, confidence, meta) {
    const payload = canonicalEncode({
        previous_hash: previousHash,
        type,
        content,
        evidence,
        timestamp,
        agent_id: agentId,
        confidence,
        meta,
    });
    return (0, crypto_1.createHash)("sha256").update(payload, "utf8").digest("hex");
}
function assertValidNodeType(type) {
    if (!types_1.NODE_TYPES.includes(type)) {
        throw new Error(`Invalid node type: ${type}. Must be one of: ${types_1.NODE_TYPES.join(", ")}`);
    }
}
class TraceBuilder {
    constructor(state) {
        this.state = { ...state };
    }
    get nodes() {
        return [...this.state.nodes];
    }
    get boundaries() {
        return [...this.state.boundaries];
    }
    get agentId() {
        return this.state.agentId;
    }
    get context() {
        return this.state.context;
    }
    get createdAt() {
        return this.state.createdAt;
    }
    get schemaVersion() {
        return this.state.schemaVersion;
    }
    get lastHash() {
        const nodes = this.state.nodes;
        return nodes.length === 0 ? GENESIS_PREVIOUS_HASH : nodes[nodes.length - 1].hash;
    }
    get idSet() {
        return new Set(this.state.nodes.map((n) => n.id));
    }
    append(type, content, options) {
        if (this.state.readOnly) {
            throw new Error("Cannot append to a read-only trace (e.g. imported)");
        }
        assertValidNodeType(type);
        const evidence = options.evidence ?? [];
        const idSet = this.idSet;
        for (const eid of evidence) {
            if (!idSet.has(eid)) {
                throw new Error(`Evidence ID "${eid}" does not exist in this trace`);
            }
        }
        const nodeIds = this.state.nodes.map((n) => n.id);
        for (const eid of evidence) {
            const idx = nodeIds.indexOf(eid);
            if (idx < 0 || idx >= nodeIds.length) {
                throw new Error(`Evidence ID "${eid}" must reference an earlier node`);
            }
        }
        const timestamp = new Date().toISOString();
        const prevNodes = this.state.nodes;
        if (prevNodes.length > 0) {
            const lastTs = prevNodes[prevNodes.length - 1].timestamp;
            if (timestamp < lastTs) {
                throw new Error("Node timestamp must be >= previous node timestamp");
            }
        }
        const id = (0, crypto_1.randomUUID)();
        const previousHash = this.lastHash;
        const confidence = options.confidence ?? null;
        const meta = options.meta;
        const hash = computeHash(previousHash, type, content, evidence, timestamp, this.state.agentId, confidence, meta);
        const node = {
            id,
            type,
            content,
            evidence: [...evidence],
            timestamp,
            agent_id: this.state.agentId,
            confidence,
            meta,
            hash,
            previous_hash: previousHash,
        };
        this.state.nodes.push(node);
        return node;
    }
    observe(content, options) {
        return this.append("OBSERVE", content, {
            confidence: options?.confidence,
        });
    }
    derive(content, options) {
        return this.append("DERIVE", content, {
            evidence: options.evidence,
            confidence: options.confidence,
        });
    }
    assume(content, options) {
        return this.append("ASSUME", content, {
            confidence: options?.confidence,
        });
    }
    decide(decisionText, options) {
        const evidence = options.evidence ?? [];
        const meta = {
            alternatives: options.alternatives,
            reasoning: options.reasoning,
        };
        return this.append("DECIDE", decisionText, {
            evidence,
            confidence: options.confidence,
            meta,
        });
    }
    act(content, options) {
        return this.append("ACT", content, {
            confidence: options?.confidence,
        });
    }
    setBoundary(name, options) {
        if (this.state.readOnly) {
            throw new Error("Cannot set boundaries on a read-only trace");
        }
        const idSet = this.idSet;
        const alreadyAssigned = new Set();
        for (const b of this.state.boundaries) {
            for (const nid of b.nodes)
                alreadyAssigned.add(nid);
        }
        for (const nid of options.nodes) {
            if (!idSet.has(nid)) {
                throw new Error(`Boundary node "${nid}" is not in this trace`);
            }
            if (alreadyAssigned.has(nid)) {
                throw new Error(`Node "${nid}" already belongs to another trust boundary`);
            }
            alreadyAssigned.add(nid);
        }
        const boundary = (0, trust_1.createTrustBoundary)({
            name,
            description: options.description ?? "",
            nodes: options.nodes,
        });
        this.state.boundaries.push(boundary);
        return boundary;
    }
    getState() {
        return {
            nodes: [...this.state.nodes],
            boundaries: [...this.state.boundaries],
            agentId: this.state.agentId,
            context: this.state.context,
            createdAt: this.state.createdAt,
            schemaVersion: this.state.schemaVersion,
            readOnly: this.state.readOnly,
        };
    }
}
exports.TraceBuilder = TraceBuilder;
function createTrace(options) {
    return new TraceBuilder({
        nodes: [],
        boundaries: [],
        agentId: options.agentId,
        context: options.context,
        createdAt: new Date().toISOString(),
        schemaVersion: "CAP-1.0",
    });
}
//# sourceMappingURL=trace.js.map