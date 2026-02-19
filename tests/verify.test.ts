/**
 * Hash chain verification, tamper detection, evidence and boundary checks.
 */

import { createTrace, verifyTrace, importJSON, exportJSON } from "../src/index";

describe("verifyTrace", () => {
  test("valid trace passes verification", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    trace.observe("a");
    trace.observe("b");
    trace.setBoundary("b1", { nodes: trace.nodes.map((n) => n.id) });
    const result = verifyTrace(trace);
    expect(result.valid).toBe(true);
  });

  test("modifying node content breaks verification at that node", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n1 = trace.observe("original");
    trace.observe("second");
    trace.setBoundary("b1", { nodes: trace.nodes.map((n) => n.id) });
    expect(verifyTrace(trace).valid).toBe(true);
    const nodes = trace.nodes;
    const broken = nodes.find((n) => n.id === n1.id)!;
    (broken as any).content = "tampered";
    const result = verifyTrace({ nodes, boundaries: trace.boundaries });
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(n1.id);
  });

  test("modifying any field breaks verification", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    trace.observe("a");
    trace.observe("b");
    trace.setBoundary("b1", { nodes: trace.nodes.map((n) => n.id) });
    const nodes = trace.nodes.map((n) => ({ ...n }));
    nodes[0].timestamp = "2020-01-01T00:00:00.000Z";
    const result = verifyTrace({ nodes, boundaries: trace.boundaries });
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBeDefined();
  });

  test("incomplete trust boundary coverage fails verification", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n1 = trace.observe("a");
    trace.observe("b");
    trace.setBoundary("b1", { nodes: [n1.id] });
    const result = verifyTrace(trace);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/does not belong to any trust boundary/);
  });

  test("node in two boundaries fails verification", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n1 = trace.observe("a");
    const n2 = trace.observe("b");
    trace.setBoundary("b1", { nodes: [n1.id] });
    const boundaries = [
      ...trace.boundaries,
      { id: "b2-id", name: "b2", description: "", nodes: [n1.id, n2.id] },
    ];
    const result = verifyTrace({ nodes: trace.nodes, boundaries });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/more than one/);
  });

  test("evidence referencing later node fails verification", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n1 = trace.observe("first");
    const n2 = trace.observe("second");
    trace.derive("conclusion", { evidence: [n1.id] });
    trace.setBoundary("b1", { nodes: trace.nodes.map((n) => n.id) });
    expect(verifyTrace(trace).valid).toBe(true);
    const nodes = trace.nodes.map((n) => ({ ...n }));
    const deriveNode = nodes.find((n) => n.type === "DERIVE")!;
    deriveNode.evidence = [n2.id];
    const result = verifyTrace({ nodes, boundaries: trace.boundaries });
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(deriveNode.id);
  });
});

describe("empty trace", () => {
  test("trace with zero nodes is valid", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const result = verifyTrace(trace);
    expect(result.valid).toBe(true);
  });

  test("empty trace with boundaries that reference no nodes fails if boundaries are non-empty with wrong nodes", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const boundaries = [
      { id: "b1", name: "b1", description: "", nodes: ["fake-id"] },
    ];
    const result = verifyTrace({ nodes: trace.nodes, boundaries });
    expect(result.valid).toBe(false);
  });
});
