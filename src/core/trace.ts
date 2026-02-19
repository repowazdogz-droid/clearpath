/**
 * Clearpath Audit Protocol (CAP-1.0) — trace construction and hash chaining.
 */

import { createHash, randomUUID } from "crypto";
import type {
  TraceNode,
  NodeType,
  TraceBuilderState,
  CreateTraceOptions,
  DeriveOptions,
  DecideOptions,
} from "./types";
import { NODE_TYPES } from "./types";
import { createTrustBoundary } from "../boundaries/trust";

const GENESIS_PREVIOUS_HASH = "0";

function canonicalEncode(node: {
  previous_hash: string;
  type: string;
  content: string;
  evidence: string[];
  timestamp: string;
  agent_id: string;
  confidence: number | null;
  meta?: Record<string, unknown>;
}): string {
  const evidenceStr = node.evidence.join("\n");
  const confidenceStr = node.confidence === null ? "" : String(node.confidence);
  const metaStr =
    node.meta === undefined
      ? ""
      : JSON.stringify(sortKeys(node.meta as Record<string, unknown>));
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

function sortKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const keys = Object.keys(obj).sort();
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = obj[k];
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out[k] = sortKeys(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function computeHash(
  previousHash: string,
  type: NodeType,
  content: string,
  evidence: string[],
  timestamp: string,
  agentId: string,
  confidence: number | null,
  meta?: Record<string, unknown>
): string {
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
  return createHash("sha256").update(payload, "utf8").digest("hex");
}

function assertValidNodeType(type: string): asserts type is NodeType {
  if (!NODE_TYPES.includes(type as NodeType)) {
    throw new Error(`Invalid node type: ${type}. Must be one of: ${NODE_TYPES.join(", ")}`);
  }
}

export class TraceBuilder {
  private state: TraceBuilderState;

  constructor(state: TraceBuilderState) {
    this.state = { ...state };
  }

  get nodes(): TraceNode[] {
    return [...this.state.nodes];
  }

  get boundaries(): import("./types").TrustBoundary[] {
    return [...this.state.boundaries];
  }

  get agentId(): string {
    return this.state.agentId;
  }

  get context(): string {
    return this.state.context;
  }

  get createdAt(): string {
    return this.state.createdAt;
  }

  get schemaVersion(): "CAP-1.0" {
    return this.state.schemaVersion;
  }

  private get lastHash(): string {
    const nodes = this.state.nodes;
    return nodes.length === 0 ? GENESIS_PREVIOUS_HASH : nodes[nodes.length - 1].hash;
  }

  private get idSet(): Set<string> {
    return new Set(this.state.nodes.map((n) => n.id));
  }

  private append(
    type: NodeType,
    content: string,
    options: {
      evidence?: string[];
      confidence?: number;
      meta?: Record<string, unknown>;
    }
  ): TraceNode {
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
    const id = randomUUID();
    const previousHash = this.lastHash;
    const confidence = options.confidence ?? null;
    const meta = options.meta;
    const hash = computeHash(
      previousHash,
      type,
      content,
      evidence,
      timestamp,
      this.state.agentId,
      confidence,
      meta
    );
    const node: TraceNode = {
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

  observe(content: string, options?: { confidence?: number }): TraceNode {
    return this.append("OBSERVE", content, {
      confidence: options?.confidence,
    });
  }

  derive(content: string, options: DeriveOptions): TraceNode {
    return this.append("DERIVE", content, {
      evidence: options.evidence,
      confidence: options.confidence,
    });
  }

  assume(content: string, options?: { confidence?: number }): TraceNode {
    return this.append("ASSUME", content, {
      confidence: options?.confidence,
    });
  }

  decide(
    decisionText: string,
    options: DecideOptions
  ): TraceNode {
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

  act(content: string, options?: { confidence?: number }): TraceNode {
    return this.append("ACT", content, {
      confidence: options?.confidence,
    });
  }

  setBoundary(
    name: string,
    options: { nodes: string[]; description?: string }
  ): import("./types").TrustBoundary {
    if (this.state.readOnly) {
      throw new Error("Cannot set boundaries on a read-only trace");
    }
    const idSet = this.idSet;
    const alreadyAssigned = new Set<string>();
    for (const b of this.state.boundaries) {
      for (const nid of b.nodes) alreadyAssigned.add(nid);
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
    const boundary = createTrustBoundary({
      name,
      description: options.description ?? "",
      nodes: options.nodes,
    });
    this.state.boundaries.push(boundary);
    return boundary;
  }

  getState(): TraceBuilderState {
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

export function createTrace(options: CreateTraceOptions): TraceBuilder {
  return new TraceBuilder({
    nodes: [],
    boundaries: [],
    agentId: options.agentId,
    context: options.context,
    createdAt: new Date().toISOString(),
    schemaVersion: "CAP-1.0",
  });
}

export { computeHash, canonicalEncode, GENESIS_PREVIOUS_HASH };
