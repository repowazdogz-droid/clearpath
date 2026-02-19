/**
 * Clearpath Audit Protocol (CAP-1.0) — decision record creation.
 */
import type { DecisionRecord } from "./types";
import type { TraceBuilder } from "./trace";
export interface CreateRecordOptions {
    outcome?: string | null;
}
export declare function createRecord(trace: TraceBuilder | {
    nodes: import("./types").TraceNode[];
    boundaries: import("./types").TrustBoundary[];
    agentId: string;
    context: string;
    createdAt: string;
}, options?: CreateRecordOptions): DecisionRecord;
//# sourceMappingURL=record.d.ts.map