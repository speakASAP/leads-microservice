# Goal 25 - Marketing Approval Evidence Handoff Contract: Validation Report

```yaml
id: LEADS-GOAL-25-VALIDATION-REPORT
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-25-marketing-approval-evidence-handoff-contract.execution-plan.md
downstream:
  - ../docs/orchestrator/STATUS.md
  - ../docs/IMPLEMENTATION_STATE.md
  - ../TASKS.md
  - ../STATE.json
```

## Artifact Validated

Goal 25 - Marketing Approval Evidence Handoff Contract.

## Preserved Intent Evidence

Passed. Leads remains the consent-aware non-registered lead, consent, preference, confirmation, unsubscribe, and guarded contact-resolution owner. Marketing remains the approval storage, campaign content, campaign execution, audience decision, and outcome owner. Notifications remains delivery owner.

## Gate Evidence

Pre-coding gate: pass-with-documented-risk. DocsRAG retrieval was attempted from the in-cluster Leads runtime pod and returned HTTP 500; repo-local source contracts from Goals 11, 16, and 17 were used.

## Invariant Evidence

- LEADS-INV-001: preserved; contact resolution remains Leads-owned and one-lead scoped.
- LEADS-INV-002: preserved; Marketing approval storage and campaign execution remain outside Leads.
- LEADS-INV-003: strengthened; approved campaign contact resolution still re-checks consent, consent evidence, unsubscribe, channel support, and confirmation when required.
- LEADS-INV-004: strengthened; approval summaries omit contact values, campaign content, raw messages, confirmation tokens, private URLs, raw consent source values, and metadata values.
- LEADS-INV-005: passed; no campaign execution, send loop, or outbound dispatch was added.
- LEADS-INV-006: preserved; public intake and list bounds unchanged.
- LEADS-INV-007: preserved; existing internal guard remains required.
- LEADS-INV-008: preserved; no Notifications campaign dispatch was added.
- LEADS-INV-009: preserved; no AI/CRM export was added.
- LEADS-INV-010: passed; evidence recorded here and in `docs/orchestrator/STATUS.md`.

## Sensitive-Data Evidence

Passed. Tests use synthetic values only. No secrets, production lead rows, real contact values, raw messages, confirmation token values, private URLs, metadata values, raw consent source values, JWTs, or campaign content were added to Goal 25 artifacts. A broad source scan flagged existing `confirmationToken` code identifiers only; the Goal 25 artifact/source scan passed.

## Consent Evidence

Passed. For approved campaign sends, Leads requires structured approval evidence and still re-checks eligibility before returning contact values. Ineligible or unsubscribed leads return no campaign contact values.

## Contract Evidence

Internal guarded contact-resolution contract is tightened for `approved_campaign_send`: structured `approvalEvidence` is required, exactly one channel may be requested, and the requested channel must match the approved channel. No public API, schema, migration, Auth, Notifications, AI, CRM, deployment, or production behavior changed.

## Replay/Determinism Evidence

Passed. No durable write, replay cursor, idempotency key, or retry behavior was added. Approval summary construction and rejection reason generation are deterministic from request fields.

## Commands Run

- `npm test -- --runTestsByPath src/leads/integrations/marketing-approval-evidence.spec.ts src/leads/leads.service.spec.ts src/leads/leads.controller.spec.ts`: passed, 3 suites, 35 tests.
- `npm run build`: passed.
- `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`: passed with no matches.
- Goal 25 secret scan over docs/artifacts/new approval-evidence files: passed.
- `npm test`: passed, 15 suites, 86 tests.

## Passed Criteria

- Contract requires affirmative consent evidence, no unsubscribe state, bounded purpose, and human approval reference before campaign contact resolution.
- Leads does not execute campaigns, store campaign content, initiate outbound sends, or add a raw export surface.
- Tests prove approval summaries/log metadata omit campaign content and contact values.
- Build, focused tests, full tests, missing-marker scan, and Goal 25 secret scan passed.

## Failed Or Skipped Criteria

- DocsRAG content retrieval skipped after in-cluster query returned HTTP 500.
- Deployment skipped because no deployment was requested or allowed.
- Runtime approval storage remains blocked pending owner decision; this implementation keeps approval storage Marketing-owned.

## Decision

Pass.

## Next Action

Marketing integration can adapt to the structured `approvalEvidence` request contract. Any durable approval storage in Leads remains blocked until the owner explicitly selects a Leads-owned approval evidence slice.
