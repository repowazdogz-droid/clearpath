/**
 * Clearpath Audit Protocol (CAP-1.0) — decision record creation.
 */

import { randomUUID } from "crypto";
import type { DecisionRecord, VerificationStatus } from "./types";
import type { TraceBuilder } from "./trace";
import { verifyTrace } from "./verify";

export interface CreateRecordOptions {
  outcome?: string | null;
}

export function createRecord(
  trace: TraceBuilder | { nodes: import("./types").TraceNode[]; boundaries: import("./types").TrustBoundary[]; agentId: string; context: string; createdAt: string },
  options: CreateRecordOptions = {}
): DecisionRecord {
  const nodes = trace.nodes;
  const boundaries = trace.boundaries;
  const agentId = trace.agentId;
  const context = trace.context;
  const createdAt = trace.createdAt ?? new Date().toISOString();

  const result = verifyTrace({ nodes, boundaries });
  const verification_status: VerificationStatus = result.valid
    ? "verified"
    : "tampered";

  return {
    id: randomUUID(),
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
