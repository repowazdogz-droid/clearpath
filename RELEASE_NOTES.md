# Release Notes

## 1.1.0 - 2026-04-26

Backward-compatible additive release for CAP-1.1.

- Added a first-class faithfulness state on trace nodes.
- Supported four states: `verified_faithful`, `narrative`, `unverified`, and `disputed`.
- Added `getFaithfulnessReport()` to summarize faithfulness states across a chain.
- Preserved CAP-1.0 import and verification compatibility for traces without a `faithfulness` field.
- Updated README examples and public framing.
- Added faithfulness tests covering defaults, all states, serialization, hashing, reports, and legacy traces.
- No breaking changes.
- See `V2_DESIGN.md` for the design rationale and research context.

## 1.0.1 - 2026-04-26

Release hygiene pass for CAP-1.0.

- Rebuilt distributable files from TypeScript source.
- Verified dependency installation, audit, tests, and build locally.
- Normalised package metadata for npm/GitHub citation.
- Added MIT license file when missing.
- Recorded local folder name: clearpath.
- Recorded GitHub repository: repowazdogz-droid/clearpath.

No protocol schema or runtime semantics were intentionally changed.
