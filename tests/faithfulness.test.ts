/**
 * CAP-1.1 faithfulness state support.
 */

import {
  createTrace,
  exportJSON,
  getFaithfulnessReport,
  importJSON,
  verifyTrace,
  type FaithfulnessState,
} from "../src/index";
import { computeHash, GENESIS_PREVIOUS_HASH } from "../src/core/trace";

const STATES: FaithfulnessState[] = [
  "verified_faithful",
  "narrative",
  "unverified",
  "disputed",
];

describe("CAP-1.1 faithfulness", () => {
  test("default faithfulness state is unverified", () => {
    const trace = createTrace({ agentId: "a1", context: "faithfulness" });
    const node = trace.observe("Observation");

    expect(node.faithfulness).toBe("unverified");
  });

  test.each(STATES)("setting faithfulness to %s works", (state) => {
    const trace = createTrace({ agentId: "a1", context: "faithfulness" });
    const node = trace.observe("Observation", { faithfulness: state });
    trace.setBoundary("agent", { nodes: trace.nodes.map((traceNode) => traceNode.id) });

    expect(node.faithfulness).toBe(state);
    expect(verifyTrace(trace).valid).toBe(true);
  });

  test("faithfulness state survives chain serialisation", () => {
    const trace = createTrace({ agentId: "a1", context: "faithfulness" });
    const observed = trace.observe("Premise", {
      faithfulness: "verified_faithful",
    });
    trace.derive("Conclusion", {
      evidence: [observed.id],
      faithfulness: "narrative",
    });
    trace.setBoundary("agent", { nodes: trace.nodes.map((node) => node.id) });

    const imported = importJSON(exportJSON(trace));

    expect(imported.nodes[0].faithfulness).toBe("verified_faithful");
    expect(imported.nodes[1].faithfulness).toBe("narrative");
    expect(verifyTrace(imported).valid).toBe(true);
  });

  test("faithfulness state hashes into the chain when present", () => {
    const trace = createTrace({ agentId: "a1", context: "faithfulness" });
    trace.observe("Premise", { faithfulness: "verified_faithful" });
    trace.setBoundary("agent", { nodes: trace.nodes.map((node) => node.id) });

    expect(verifyTrace(trace).valid).toBe(true);

    const nodes = trace.nodes.map((node) => ({ ...node }));
    nodes[0].faithfulness = "narrative";

    expect(verifyTrace({ nodes, boundaries: trace.boundaries }).valid).toBe(false);
  });

  test("getFaithfulnessReport returns expected summary", () => {
    const trace = createTrace({ agentId: "a1", context: "faithfulness" });
    trace.observe("Observation", { faithfulness: "verified_faithful" });
    trace.assume("Assumption", { faithfulness: "narrative" });
    trace.act("Action", { faithfulness: "disputed" });
    trace.observe("Unspecified");

    expect(getFaithfulnessReport(trace)).toEqual({
      total: 4,
      verified_faithful: 1,
      narrative: 1,
      unverified: 1,
      disputed: 1,
    });
  });

  test("CAP-1.0 traces without faithfulness still verify correctly", () => {
    const trace = createTrace({ agentId: "a1", context: "legacy" });
    const first = trace.observe("Legacy observation");
    trace.derive("Legacy conclusion", { evidence: [first.id] });
    trace.setBoundary("agent", { nodes: trace.nodes.map((node) => node.id) });

    const legacyPayload = JSON.parse(exportJSON(trace));
    legacyPayload.schema_version = "CAP-1.0";
    let previousHash = GENESIS_PREVIOUS_HASH;
    for (const node of legacyPayload.nodes) {
      delete node.faithfulness;
      node.previous_hash = previousHash;
      node.hash = computeHash(
        node.previous_hash,
        node.type,
        node.content,
        node.evidence,
        undefined,
        node.timestamp,
        node.agent_id,
        node.confidence,
        node.meta,
      );
      previousHash = node.hash;
    }

    const imported = importJSON(JSON.stringify(legacyPayload));

    expect(imported.schemaVersion).toBe("CAP-1.0");
    expect(imported.nodes[0].faithfulness).toBeUndefined();
    expect(verifyTrace(imported).valid).toBe(true);
    expect(getFaithfulnessReport(imported)).toEqual({
      total: 2,
      verified_faithful: 0,
      narrative: 0,
      unverified: 2,
      disputed: 0,
    });
  });
});
