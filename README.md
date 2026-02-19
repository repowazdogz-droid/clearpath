# Clearpath Audit Protocol (CAP-1.0)

A tamper-evident decision trace system for AI agent accountability. Clearpath captures what an agent decided, why, what evidence it used, and what alternatives it rejected — in a hash-chained, independently verifiable format.

Clearpath is a **protocol**: the underlying data structure and verification layer that monitoring tools can build on. It is not a dashboard, observability UI, or API server.

## Install

```bash
npm install clearpath
```

## Quick Start

```typescript
const { createTrace, verifyTrace, exportMarkdown } = require('clearpath');

const trace = createTrace({ agentId: 'agent-1', context: 'Purchase approval' });

trace.observe('Received purchase request for $5,000 from user@company.com');
trace.observe('Current budget remaining: $12,000');
trace.derive('Purchase is within budget limits', { evidence: [/* node IDs */] });
trace.assume('User has authority to make purchases up to $10,000');
trace.decide('Approve purchase', {
  alternatives: ['Reject', 'Escalate to manager'],
  reasoning: 'Within budget and authority limits',
});
trace.act('Sent approval to procurement system');

trace.setBoundary('human_initiated', { nodes: [/* ... */] });
trace.setBoundary('agent_autonomous', { nodes: [/* ... */] });

const result = verifyTrace(trace); // { valid: true } or { valid: false, brokenAt: nodeId }
const markdown = exportMarkdown(trace);
```

## Schema

- **TraceNode**: `OBSERVE` | `DERIVE` | `ASSUME` | `DECIDE` | `ACT` — hash-chained with SHA-256.
- **TrustBoundary**: Groups of nodes where responsibility transitions (human → agent, agent → external).
- **DecisionRecord**: Full auditable record (trace + boundaries + outcome + verification status).

## Verification

Every node's hash includes the previous node's hash. Modifying any node breaks the chain; `verifyTrace()` returns the first broken node.

## License

MIT
