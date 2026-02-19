/**
 * Trace construction, hash chaining, genesis node, node types, evidence refs.
 */

import { createTrace, verifyTrace, GENESIS_PREVIOUS_HASH } from "../src/index";

describe("TraceBuilder", () => {
  test("genesis node has previous_hash of 0", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n = trace.observe("first");
    expect(n.previous_hash).toBe(GENESIS_PREVIOUS_HASH);
    expect(n.hash).toBeDefined();
    expect(n.id).toBeDefined();
    expect(n.type).toBe("OBSERVE");
  });

  test("hash chain: second node includes previous hash", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n1 = trace.observe("first");
    const n2 = trace.observe("second");
    expect(n2.previous_hash).toBe(n1.hash);
  });

  test("only valid node types accepted", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    expect(() => (trace as any).append("INVALID", "x", {})).toThrow(/Invalid node type/);
  });

  test("evidence must reference existing earlier nodes", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n1 = trace.observe("one");
    const n2 = trace.observe("two");
    trace.derive("conclusion", { evidence: [n1.id, n2.id] });
    expect(trace.nodes.length).toBe(3);
  });

  test("evidence reference to non-existent node throws", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    trace.observe("one");
    expect(() =>
      trace.derive("conclusion", { evidence: ["non-existent-id"] })
    ).toThrow(/does not exist/);
  });

  test("decide stores alternatives and reasoning in meta", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n = trace.decide("Approve", {
      alternatives: ["Reject", "Escalate"],
      reasoning: "Within policy",
    });
    expect(n.content).toBe("Approve");
    expect(n.meta).toEqual({
      alternatives: ["Reject", "Escalate"],
      reasoning: "Within policy",
    });
  });

  test("timestamp ordering enforced", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    trace.observe("first");
    trace.observe("second");
    const nodes = trace.nodes;
    expect(new Date(nodes[1].timestamp).getTime()).toBeGreaterThanOrEqual(
      new Date(nodes[0].timestamp).getTime()
    );
  });
});
