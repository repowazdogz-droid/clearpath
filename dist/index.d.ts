/**
 * Clearpath Audit Protocol (CAP-1.1) — public API.
 */
export { createTrace, TraceBuilder, GENESIS_PREVIOUS_HASH } from "./core/trace";
export { getFaithfulnessReport, verifyTrace } from "./core/verify";
export { createRecord } from "./core/record";
export type { CreateRecordOptions } from "./core/record";
export { exportJSON, importJSON } from "./export/json";
export { exportMarkdown } from "./export/markdown";
export { createTrustBoundary, validateBoundaryCoverage } from "./boundaries/trust";
export type { TraceNode, NodeType, FaithfulnessReport, FaithfulnessState, TrustBoundary, DecisionRecord, VerificationStatus, VerifyResult, ExportedTrace, } from "./core/types";
//# sourceMappingURL=index.d.ts.map