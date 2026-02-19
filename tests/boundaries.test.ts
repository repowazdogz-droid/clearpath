/**
 * Trust boundary creation and validation.
 */

import { createTrace, verifyTrace } from "../src/index";

describe("Trust boundaries", () => {
  test("every node must belong to exactly one boundary", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    trace.observe("a");
    trace.observe("b");
    trace.setBoundary("human", { nodes: [trace.nodes[0].id] });
    trace.setBoundary("agent", { nodes: [trace.nodes[1].id] });
    const result = verifyTrace(trace);
    expect(result.valid).toBe(true);
  });

  test("no node in two boundaries", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    const n = trace.observe("a");
    trace.setBoundary("b1", { nodes: [n.id] });
    expect(() => trace.setBoundary("b2", { nodes: [n.id] })).toThrow();
  });

  test("boundary must only reference nodes in trace", () => {
    const trace = createTrace({ agentId: "a1", context: "test" });
    trace.observe("a");
    expect(() => trace.setBoundary("b1", { nodes: ["not-in-trace"] })).toThrow(
      /not in this trace/
    );
  });
});
