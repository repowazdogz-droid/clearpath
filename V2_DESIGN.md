# 1. CURRENT STATE

Clearpath CAP is a small TypeScript protocol/library for tamper-evident AI decision traces. It records typed nodes (`OBSERVE`, `DERIVE`, `ASSUME`, `DECIDE`, `ACT`), evidence references, confidence, optional metadata, trust boundaries, hash-chain integrity, JSON import/export, markdown export, and decision records.

Schema version: `CAP-1.0` is hard-coded in source types, trace creation, records, JSON export, JSON import validation, markdown export, README, package metadata, and tests. Package version is `1.0.1`.

Test count: 27 Jest tests across `tests/trace.test.ts`, `tests/verify.test.ts`, `tests/export.test.ts`, `tests/record.test.ts`, and `tests/boundaries.test.ts`. The README also claims 27 tests. I did not run tests because this was a design-only read-only audit.

Public usage signals: `package.json` declares package name `clearpath`, repository `github.com/repowazdogz-droid/clearpath`, MIT license, and npm-ready `dist` exports. Local Omega materials reference Clearpath as a core protocol feeding Trust Score, Assumption Registry, Harm Trace, Consent Ledger, Cognitive Ledger, Dispute Protocol, and Ethics Gate. Web search did not confirm indexed npm or GitHub usage for this exact Clearpath Audit Protocol package; search results mostly surfaced unrelated Clearpath robotics packages and a separate public CAP acronym used for Content / Creative AI Profile.

# 2. RESEARCH LANDSCAPE (2025-2026)

Recent faithfulness work makes a clear distinction between a plausible reasoning narrative and a verified causal/evidential account of why a model produced an answer.

- "Lie to Me: How Faithful Is Chain-of-Thought Reasoning in Reasoning Models?" arXiv:2603.22582. Across 12 open-weight reasoning models and 41,832 runs, measured CoT faithfulness ranged from 39.7% to 89.9%; social-pressure hints were especially weak, and thinking-token acknowledgement was much higher than answer-text acknowledgement.
- "Chain-of-Thought Reasoning In The Wild Is Not Always Faithful" arXiv:2503.08679. Shows unfaithful CoT can occur on realistic prompts without artificial bias, including implicit post-hoc rationalization and illogical shortcut rationales.
- "Closing the Confidence-Faithfulness Gap in Large Language Models" arXiv:2603.25052. Finds verbalized confidence can be orthogonal to internal accuracy signals and that joint reasoning plus confidence prompting can worsen calibration through a "Reasoning Contamination Effect."
- "A Causal Lens for Evaluating Faithfulness Metrics" arXiv:2502.18848. Introduces Causal Diagnosticity, using model editing to create faithful/unfaithful explanation pairs and compare faithfulness metrics.
- "Measuring Chain of Thought Faithfulness by Unlearning Reasoning Steps" arXiv:2502.14829. Treats faithfulness as whether intervening on/unlearning reasoning steps changes model predictions, supporting instance-level faithfulness analysis.
- "FAITHCOT-BENCH: Benchmarking Instance-Level Faithfulness of Chain-of-Thought Reasoning" arXiv:2510.04040. Frames CoT faithfulness as an instance-level discriminative task with labels, unfaithfulness reasons, and step-level evidence.
- "Faithful-First Reasoning, Planning, and Acting for Multimodal LLMs" arXiv:2511.08409. Moves toward verify-as-you-generate reasoning, requiring step-level evidential grounding before a step is admitted.
- "MetaFaith: Faithful Natural Language Uncertainty Expression in LLMs" arXiv:2505.24858. Shows uncertainty language is often unfaithful to intrinsic uncertainty and that prompt-based metacognition can improve, but not guarantee, faithful calibration.

Protocol gaps for CAP-1.0: current nodes can record evidence, confidence, and metadata, but they do not say whether a reasoning trace is an independently verified faithful explanation or a narrative reconstruction. `confidence` is especially risky because recent work shows confidence can be unfaithful. Trust boundaries identify responsibility transitions, but not epistemic status. Verification currently means hash integrity and structural validity, not reasoning faithfulness.

# 3. SCHEMA DECISION

v1.x BUMP.

Do not upgrade to `CAP-2.0` yet. The research warrants an explicit faithfulness status, but the change can be introduced as a backward-compatible optional field on trace nodes. Existing `CAP-1.0` records remain valid, existing hashes can continue to verify when the field is absent, and old consumers can ignore the new field if JSON import remains tolerant.

Recommended target: `CAP-1.1`, not `CAP-2.0`. Reserve `CAP-2.0` for a future breaking move where every trace must carry formal faithfulness attestations, external verifier receipts, or changed hash canonicalization rules that cannot preserve `CAP-1.0` verification.

# 4. PROPOSED SCHEMA CHANGES

Add an optional `faithfulness` object to each `TraceNode`.

Field:

```ts
faithfulness?: {
  status: "verified_faithful" | "narrative" | "unverified" | "disputed";
  basis?: "deterministic_execution" | "evidence_grounding" | "causal_intervention" | "human_review" | "model_self_report" | "none";
  verifier?: string;
  score?: number;
  checked_at?: string;
  evidence?: string[];
  notes?: string;
};
```

Semantics:

- `verified_faithful`: the node's reasoning claim is supported by an external check, deterministic execution, causal intervention, evidence-grounding procedure, or documented human review.
- `narrative`: the node records a model- or human-written explanation that may be useful for audit but is not claimed to be a faithful causal account.
- `unverified`: no faithfulness check has been performed.
- `disputed`: a later review challenges the node's faithfulness.
- `basis`: records the type of evidence behind the status; `model_self_report` must not be enough for `verified_faithful`.
- `score`: optional continuous confidence in the faithfulness assessment, constrained to `0 <= score <= 1`.
- `evidence`: optional references to earlier CAP nodes or external verifier artifacts.

Migration:

- Existing `CAP-1.0` traces import with `faithfulness` absent.
- Exporters for `CAP-1.1` may omit `faithfulness` for legacy traces or set `status: "unverified"` only when a caller explicitly asks to normalize.
- Markdown export should label nodes with `Faithfulness: verified_faithful`, `Faithfulness: narrative`, `Faithfulness: unverified`, or `Faithfulness: disputed` when present.
- `verifyTrace()` should continue to verify hash integrity and structural validity; faithfulness is a separate audit property unless a later strict verifier is added.

Backcompat:

- If `faithfulness` is included in a node, it should be included in canonical hashing for newly created nodes so later edits are tamper-evident.
- Existing hashes must remain valid for nodes where `faithfulness` is absent.
- `importJSON()` should accept both `CAP-1.0` and `CAP-1.1` during the transition if the project chooses the bump.
- `TraceNode.meta` remains available for domain-specific data; do not overload `meta` for the standard faithfulness flag once `CAP-1.1` exists.

# 5. PUBLIC FRAMING UPDATE

README paragraph/section to add:

```md
## Faithfulness note

Clearpath verifies that a decision trace has not been tampered with; it does not automatically prove that a reasoning narrative is the true causal reason an AI system reached its answer. Recent chain-of-thought faithfulness research shows that reasoning text can be useful audit evidence while still being post-hoc, selective, or unverified. CAP-1.1 therefore marks trace nodes by faithfulness status: `verified_faithful` when independently checked, `narrative` when recorded as an explanation without causal verification, `unverified` when no check has been performed, and `disputed` when later review challenges the trace.
```

# 6. CROSS-PROTOCOL RELATIONSHIPS

Clearpath is the decision-trace substrate for the Omega protocol stack.

- Trust Score Protocol consumes Clearpath traces for accuracy, transparency, evidence quality, and scope adherence. A faithfulness flag would give Trust Score a cleaner signal than raw confidence or trace validity.
- Assumption Registry links assumptions to Clearpath decision traces. Faithfulness status should help distinguish explicit assumptions from post-hoc rationale.
- Harm Trace links consequences back to Clearpath decisions. In harm investigations, a `narrative` decision trace should carry lower evidentiary weight than a `verified_faithful` trace.
- Consent Ledger links actions to authorisation and optional Clearpath traces. Faithfulness does not replace consent; it qualifies the reasoning evidence behind an authorised action.
- Cognitive Ledger profiles decision-makers across decisions. Faithfulness status can become a longitudinal reliability feature.
- Dispute Protocol compares Clearpath traces to locate divergence. A disputed or narrative faithfulness status should be surfaced during divergence analysis.
- Ethics Gate sits above the stack. It should treat hash-valid but narrative-only reasoning as inspectable evidence, not proof of safe or ethical reasoning.
- External CAP/VAP/C2PA/SCITT-style provenance systems focus on verifiable evidence and anchoring. Clearpath should avoid acronym confusion by framing itself as Clearpath Audit Protocol and by specifying that hash validity is not equivalent to reasoning faithfulness.

# 7. IMPLEMENTATION SCOPE

Minimal `CAP-1.1` implementation scope:

- Extend `TraceNode` with optional `faithfulness`.
- Add creation options for node methods or a helper to annotate node faithfulness.
- Include `faithfulness` in canonical hashing when present.
- Update JSON import/export to accept `CAP-1.0` and `CAP-1.1`.
- Update markdown export to display faithfulness status when present.
- Add tests for absent-field backcompat, present-field hash tamper detection, schema import acceptance, markdown display, and invalid status rejection.
- Update README framing without claiming CAP proves reasoning truth.

Out of scope for the first bump:

- No model-internal verifier.
- No mandatory faithfulness labels for every trace.
- No replacement of trust boundaries, confidence, evidence references, or decision records.
- No `CAP-2.0` breaking migration.

# 8. RECOMMENDATION

Ship `CAP-1.1` with an optional per-node faithfulness flag; do not make a breaking `CAP-2.0` upgrade until faithfulness verification becomes mandatory and externally attestable.
