/**
 * JSON export/import roundtrip, markdown export.
 */

import {
  createTrace,
  verifyTrace,
  exportJSON,
  importJSON,
  exportMarkdown,
} from "../src/index";

describe("exportJSON / importJSON", () => {
  test("roundtrip: export -> import -> verify passes", () => {
    const trace = createTrace({ agentId: "agent-1", context: "Purchase approval" });
    const n1 = trace.observe("Request received");
    const n2 = trace.observe("Budget checked");
    trace.derive("Within budget", { evidence: [n1.id, n2.id] });
    trace.setBoundary("human", { nodes: [n1.id] });
    trace.setBoundary("agent", { nodes: [n2.id, trace.nodes[2].id] });
    const json = exportJSON(trace);
    const trace2 = importJSON(json);
    const result = verifyTrace(trace2);
    expect(result.valid).toBe(true);
    expect(trace2.nodes.length).toBe(3);
    expect(trace2.agentId).toBe("agent-1");
  });

  test("import rejects wrong schema_version", () => {
    const bad = JSON.stringify({
      schema_version: "CAP-0.9",
      agent_id: "a",
      context: "c",
      created_at: new Date().toISOString(),
      nodes: [],
      trust_boundaries: [],
    });
    expect(() => importJSON(bad)).toThrow(/CAP-1.0/);
  });

  test("import rejects nodes not ordered by timestamp", () => {
    const trace = createTrace({ agentId: "a", context: "c" });
    trace.observe("first");
    trace.observe("second");
    trace.setBoundary("b", { nodes: trace.nodes.map((n) => n.id) });
    const data = JSON.parse(exportJSON(trace));
    data.nodes[0].timestamp = "2026-01-02T00:00:00.000Z";
    data.nodes[1].timestamp = "2026-01-01T00:00:00.000Z";
    expect(() => importJSON(JSON.stringify(data))).toThrow(/ordered by timestamp/);
  });

  test("imported trace is read-only", () => {
    const trace = createTrace({ agentId: "a", context: "c" });
    trace.observe("x");
    trace.setBoundary("b", { nodes: trace.nodes.map((n) => n.id) });
    const trace2 = importJSON(exportJSON(trace));
    expect(() => trace2.observe("y")).toThrow(/read-only/);
    expect(() => trace2.setBoundary("b2", { nodes: [] })).toThrow(/read-only/);
  });
});

describe("exportMarkdown", () => {
  test("produces human-readable output with verification status", () => {
    const trace = createTrace({ agentId: "a1", context: "Purchase" });
    trace.observe("Request");
    trace.decide("Approve", {
      alternatives: ["Reject"],
      reasoning: "Within policy",
    });
    trace.setBoundary("b1", { nodes: trace.nodes.map((n) => n.id) });
    const md = exportMarkdown(trace);
    expect(md).toContain("# Decision Trace: Purchase");
    expect(md).toContain("**Agent:** a1");
    expect(md).toContain("CAP-1.0");
    expect(md).toContain("Valid");
    expect(md).toContain("[OBSERVE]");
    expect(md).toContain("[DECIDE]");
    expect(md).toContain("**Decision:** Approve");
    expect(md).toContain("Alternatives considered");
    expect(md).toContain("Reasoning");
  });
});

describe("canonical hash determinism", () => {
  test("same node data produces identical hash across runs", () => {
    const trace1 = createTrace({ agentId: "a", context: "c" });
    const trace2 = createTrace({ agentId: "a", context: "c" });
    trace1.observe("identical content");
    trace2.observe("identical content");
    const hash1 = trace1.nodes[0].hash;
    const hash2 = trace2.nodes[0].hash;
    expect(hash1).toBe(hash2);
  });

  test("DECIDE meta (alternatives, reasoning) included in hash", () => {
    const trace = createTrace({ agentId: "a", context: "c" });
    trace.decide("Approve", {
      alternatives: ["Reject", "Escalate"],
      reasoning: "Within policy",
    });
    trace.setBoundary("b", { nodes: trace.nodes.map((n) => n.id) });
    expect(verifyTrace(trace).valid).toBe(true);
    const nodes = trace.nodes.map((n) => ({ ...n }));
    (nodes[0].meta as any).reasoning = "Tampered";
    expect(verifyTrace({ nodes, boundaries: trace.boundaries }).valid).toBe(
      false
    );
  });
});
