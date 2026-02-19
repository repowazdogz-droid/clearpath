/**
 * Clearpath Audit Protocol (CAP-1.0) — JSON export and import.
 */
import type { TraceBuilder } from "../core/trace";
import type { ExportedTrace } from "../core/types";
export type TraceLike = TraceBuilder | ExportedTrace;
/**
 * Export trace to JSON string. Deterministic: no pretty-print whitespace.
 */
export declare function exportJSON(trace: TraceLike): string;
/**
 * Import trace from JSON string. Validates schema, node order, and hashes presence.
 * Does NOT recompute hashes; verification does that separately.
 * Returns a read-only TraceBuilder (no appending).
 */
export declare function importJSON(json: string): TraceBuilder;
//# sourceMappingURL=json.d.ts.map