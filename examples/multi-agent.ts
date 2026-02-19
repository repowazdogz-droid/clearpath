/**
 * Two agents coordinating with trust boundary handoff.
 * Run with: npx ts-node examples/multi-agent.ts
 */

const { createTrace, verifyTrace, exportJSON, importJSON } = require("../dist/index");

const agent1 = createTrace({ agentId: "agent-1", context: "Triage request" });
const o1 = agent1.observe("Incoming support ticket: login failure");
const o2 = agent1.observe("User tier: enterprise");
agent1.derive("High-priority ticket", { evidence: [o1.id, o2.id] });
agent1.decide("Escalate to agent-2", {
  alternatives: ["Handle locally", "Close as duplicate"],
  reasoning: "Enterprise tier requires dedicated handling",
});
agent1.setBoundary("agent_1", { nodes: agent1.nodes.map((n) => n.id) });

const json = exportJSON(agent1);
const rehydrated = importJSON(json);
console.log("Roundtrip verify:", verifyTrace(rehydrated).valid);
console.log("Nodes:", rehydrated.nodes.length);
console.log("Context:", rehydrated.context);
