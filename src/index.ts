/**
 * Clearpath Audit Protocol (CAP-1.0) — public API.
 */

export { createTrace, TraceBuilder, GENESIS_PREVIOUS_HASH } from "./core/trace";
export { verifyTrace } from "./core/verify";
export { createRecord } from "./core/record";
export type { CreateRecordOptions } from "./core/record";
export { exportJSON, importJSON } from "./export/json";
export { exportMarkdown } from "./export/markdown";
export { createTrustBoundary, validateBoundaryCoverage } from "./boundaries/trust";
export type {
  TraceNode,
  NodeType,
  TrustBoundary,
  DecisionRecord,
  VerificationStatus,
  VerifyResult,
  ExportedTrace,
} from "./core/types";
