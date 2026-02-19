/**
 * Minimal example: agent makes a purchase decision.
 * Run with: npx ts-node examples/simple-agent.ts
 */

const { createTrace, verifyTrace, exportMarkdown, createRecord } = require("../dist/index");

const trace = createTrace({ agentId: "agent-1", context: "Purchase approval" });

const n1 = trace.observe("Received purchase request for $5,000 from user@company.com");
const n2 = trace.observe("Current budget remaining: $12,000");
trace.derive("Purchase is within budget limits", { evidence: [n1.id, n2.id] });
trace.assume("User has authority to make purchases up to $10,000");
trace.decide("Approve purchase", {
  alternatives: ["Reject", "Escalate to manager"],
  reasoning: "Within budget and authority limits",
});
trace.act("Sent approval to procurement system");

trace.setBoundary("human_initiated", { nodes: [n1.id] });
trace.setBoundary("agent_autonomous", {
  nodes: trace.nodes.slice(1).map((n) => n.id),
});

const result = verifyTrace(trace);
console.log("Verification:", result.valid ? "PASS" : "FAIL", result);

const record = createRecord(trace, { outcome: "Purchase completed successfully" });
console.log("Record status:", record.verification_status);

console.log("\n--- Markdown ---\n");
console.log(exportMarkdown(trace));
