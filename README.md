# Clearpath Audit Protocol (CAP-1.1)

Tamper-evident decision traces for AI agents.

Clearpath creates hash-chained audit trails that capture what an AI system decided, why, what evidence it used, and what alternatives it rejected. Every node in the chain is typed, timestamped, and cryptographically linked to the previous node. Any modification breaks the chain.

## Why this exists

AI agents are making high-stakes decisions with no audit trail. When a clinical AI decision is challenged, when an autonomous system fails, when a regulator asks "show me how this decision was made" — there is no record.

Clearpath is the protocol layer. It doesn't care what the AI decided. It makes the reasoning inspectable, verifiable, and reconstructable.

## Node types

- **OBSERVE** — raw input data
- **DERIVE** — inference from observations, with evidence references
- **ASSUME** — explicit assumptions (surfaced, not hidden)
- **DECIDE** — decision with alternatives considered and rejection reasoning
- **ACT** — action taken

## Key features

- Hash-chained integrity (SHA-256) — every node hashes the previous
- Trust boundaries marking responsibility transitions (human → AI, AI → external system)
- Decision records with alternatives and rejection reasoning
- Evidence references linking derived conclusions to source observations
- Verification in one line — returns first broken node if tampered
- Faithfulness state on each trace node — verified, narrative, unverified, or disputed
- Export as markdown or JSON
- Import with schema validation
- Zero external dependencies

Repository: https://github.com/repowazdogz-droid/clearpath

## Install

```bash
npm install
npm run build
```

## Quick start

```javascript
const { createTrace, verifyTrace, exportMarkdown } = require('./dist/index');

const trace = createTrace({
  agentId: 'spine-case',
  context: 'L4/5 disc herniation — surgical decision'
});

trace.observe('MRI confirms L4/5 disc herniation with nerve root compression. 12 weeks progressive radiculopathy. Conservative management failed.');

trace.derive('Surgical candidate. Imaging correlation positive. Initial confidence 0.92.', {
  evidence: [trace.nodes[0].id],
  faithfulness: 'verified_faithful'
});

trace.assume('No significant comorbidity interaction. Diabetes and anticoagulation status not cross-referenced with surgical risk weighting.');

trace.decide('Staged approach: targeted epidural injection, 6-week reassessment, surgical pathway preserved.', {
  alternatives: ['Immediate microdiscectomy', 'Extended conservative management'],
  reasoning: 'Comorbidity interaction warrants less invasive first step. Confidence recalibrated to 0.71.'
});

trace.act('Targeted epidural steroid injection under fluoroscopic guidance. 6-week reassessment scheduled.');

// Trust boundaries — who is responsible for what
trace.setBoundary('ai-reasoning', { nodes: trace.nodes.slice(0, 3).map(n => n.id) });
trace.setBoundary('clinician-decision', { nodes: trace.nodes.slice(3).map(n => n.id) });

// Verify integrity
const result = verifyTrace(trace); // { valid: true }

// Export
console.log(exportMarkdown(trace));
```

## Faithfulness Verification

Clearpath verifies that a decision trace has not been tampered with; it does not automatically prove that a reasoning narrative is the true causal reason an AI system reached its answer. CAP-1.1 adds a backward-compatible faithfulness state to every new trace node:

- `verified_faithful` — derivation tight, premises causally entail conclusion through stated steps
- `narrative` — coherent prose around a conclusion, but causal entailment from premises is not demonstrated
- `unverified` — no faithfulness check has been performed
- `disputed` — multiple verifiers disagree on faithfulness

```javascript
const {
  createTrace,
  getFaithfulnessReport,
  verifyTrace
} = require('./dist/index');

const trace = createTrace({
  agentId: 'clinical-agent',
  context: 'Triage recommendation'
});

const observation = trace.observe('Patient reports chest pain and shortness of breath.', {
  faithfulness: 'verified_faithful'
});

trace.derive('Urgent assessment recommended.', {
  evidence: [observation.id],
  faithfulness: 'narrative'
});

console.log(verifyTrace(trace)); // { valid: true }
console.log(getFaithfulnessReport(trace));
// {
//   total: 2,
//   verified_faithful: 1,
//   narrative: 1,
//   unverified: 0,
//   disputed: 0
// }
```

Existing CAP-1.0 traces without a `faithfulness` field still import and verify. See `V2_DESIGN.md` for the design rationale and research context.

## Output

```markdown
# Decision Trace: L4/5 disc herniation — surgical decision
**Agent:** spine-case
**Verification:** ✅ Valid

## Trace

### [OBSERVE] 10:21:26
MRI confirms L4/5 disc herniation with nerve root compression.
12 weeks progressive radiculopathy. Conservative management failed.
*Trust boundary: ai-reasoning*

### [DERIVE] 10:21:26
Surgical candidate. Imaging correlation positive. Initial confidence 0.92.
*Evidence: [linked to OBSERVE node]*
*Trust boundary: ai-reasoning*

### [ASSUME] 10:21:26
No significant comorbidity interaction. Diabetes and anticoagulation
status not cross-referenced with surgical risk weighting.
*Trust boundary: ai-reasoning*

### [DECIDE] 10:21:26
**Decision:** Staged approach: targeted epidural injection, 6-week
reassessment, surgical pathway preserved.
**Alternatives considered:** Immediate microdiscectomy, Extended
conservative management
**Reasoning:** Comorbidity interaction warrants less invasive first step.
Confidence recalibrated to 0.71.
*Trust boundary: clinician-decision*

### [ACT] 10:21:26
Targeted epidural steroid injection under fluoroscopic guidance.
6-week reassessment scheduled.
*Trust boundary: clinician-decision*
```

## Test

```bash
npm test
```

36 tests covering hash integrity, tamper detection, evidence references, trust boundaries, decision records, import/export roundtrip, canonical hash determinism, faithfulness state handling, and verification.

## Schema

- **TraceNode** — `OBSERVE | DERIVE | ASSUME | DECIDE | ACT` — hash-chained with SHA-256 and optional CAP-1.1 faithfulness state
- **TrustBoundary** — groups of nodes where responsibility transitions (human → agent, agent → external)
- **DecisionRecord** — full auditable record (trace + boundaries + outcome + verification status)

## Verification

Every node's hash includes the previous node's hash. Modifying any node breaks the chain. `verifyTrace()` returns the first broken node.

```javascript
const result = verifyTrace(trace);
// { valid: true }
// or { valid: false, brokenAt: 'node-id' }
```

## How it works

Clearpath is a library, not a service. No server. No database. No UI. It is the protocol layer that other applications build on.

- A clinical decision support tool imports Clearpath → every recommendation generates an audit trace
- An autonomous agent imports Clearpath → every action is logged with reasoning
- A compliance system imports Clearpath → EU AI Act documentation is generated automatically

The protocol is domain-agnostic. The audit mechanism is identical. The stakes change.

## Status

- 36 tests passing
- TypeScript, zero external dependencies
- Open-source (MIT)
- Part of the [Omega](https://omegaprotocol.org) reasoning infrastructure

## License

MIT
