/**
 * Decision record lifecycle.
 */

import { createTrace, createRecord, verifyTrace } from "../src/index";

describe("createRecord", () => {
  test("record contains trace, boundaries, outcome, verification_status", () => {
    const trace = createTrace({ agentId: "a1", context: "Purchase" });
    trace.observe("request");
    trace.setBoundary("b1", { nodes: trace.nodes.map((n) => n.id) });
    const record = createRecord(trace, { outcome: "Approved" });
    expect(record.schema_version).toBe("CAP-1.0");
    expect(record.trace.length).toBe(1);
    expect(record.trust_boundaries.length).toBe(1);
    expect(record.outcome).toBe("Approved");
    expect(record.verification_status).toBe("verified");
    expect(record.agent_id).toBe("a1");
    expect(record.context).toBe("Purchase");
  });

  test("tampered trace yields verification_status tampered", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n = trace.observe("x");
    trace.setBoundary("b1", { nodes: trace.nodes.map((n) => n.id) });
    const record = createRecord(trace);
    expect(record.verification_status).toBe("verified");
    const nodes = trace.nodes.map((n) => ({ ...n }));
    nodes[0].content = "tampered";
    const record2 = createRecord(
      { nodes, boundaries: trace.boundaries, agentId: trace.agentId, context: trace.context, createdAt: trace.createdAt },
      { outcome: null }
    );
    expect(record2.verification_status).toBe("tampered");
  });
});
