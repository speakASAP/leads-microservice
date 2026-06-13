# Goal 17 Execution Plan

## Gate Review

- Upstream traceability: Goal 11 contact-resolution contract and Goal 16 eligibility preview.
- Invariant impact: Leads remains contact/consent owner; Marketing owns campaign approval and execution.
- Sensitive-data review: endpoint returns requested contact values only; logs omit values.
- Consent impact: approved campaign send re-checks marketing consent evidence, unsubscribe state, optional confirmation, and channel support.
- Contract/schema impact: guarded internal endpoint only; no schema change.
- Replay/determinism: no lifecycle mutation; resolution is read-only.
- Validation: focused tests, full tests, build, scans.
