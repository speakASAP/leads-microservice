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

## 2026-06-15 Follow-Up Validation - Leads-Owned Minimized Storage

Status: implemented and integrated; final build, focused tests, full tests, lint, and Prisma validation passed after the Goal 24 replay blocker cleared.

Implementation evidence:

- Added Prisma model and migration for `LeadMarketingApprovalEvidence`.
- Added runtime validation for bounded approval channel, purpose, retention expectation, timestamp, and counts before storage.
- Added minimized storage record builder that omits campaign content, contact values, raw consent source values, approver value, workspace value, and content-version value.
- Updated approved campaign contact resolution to upsert minimized evidence after approval validation and eligibility re-check.
- Valid approved evidence writes eligible and ineligible contact-resolution outcomes.
- Missing, mismatched, or malformed approval evidence is rejected before storage.

Commands run:

- `npm run prisma:generate`: passed.
- `npm test -- --runTestsByPath src/leads/integrations/marketing-approval-evidence.spec.ts src/leads/leads.service.spec.ts src/leads/leads.controller.spec.ts`: passed, 3 suites, 38 tests.
- `npx prisma validate`: passed.
- `npm run build`: initially blocked by out-of-scope Goal 24 replay source, then passed on 2026-06-15 after the integrated replay source was valid.
- `git diff --check` over Goal 25 schema/source/docs/state files: passed.
- Missing-marker scan over orchestrator docs, implementation state, Goal 25 artifacts, `TASKS.md`, and `STATE.json`: passed with no matches.
- Real-secret scan over touched Goal 25 docs/source/schema/state files: passed with no matches. A broader exploratory scan flagged expected synthetic test sentinels and historic docs mentions only.
- Post-concurrent-edit rerun of the focused Jest command on 2026-06-15: passed as part of `npm test -- --runTestsByPath src/leads/integrations/lifecycle-replay-contract.spec.ts src/leads/leads.controller.spec.ts src/leads/leads.service.spec.ts`, 3 suites and 40 tests.

Sensitive-data evidence:

- Storage tests assert serialized records do not contain synthetic campaign content, contact value, raw consent source value, approver value, workspace value, or content-version value.
- No production lead rows, real contact values, raw messages, confirmation tokens, JWTs, private URLs, metadata values, raw consent source values, or secrets were printed or persisted.

Blockers:

- No source validation blocker remains in the integrated remote tree.
- Deployment was not run in this session and remains owner-controlled.

Decision:

- Goal 25 storage slice is integrated and validated with the Goal 24 replay lane.

## 2026-06-15 Integrated Validation Addendum

Commands run after the Goal 24 replay source blocker cleared:

- `npm run build`: passed.
- `npm test -- --runTestsByPath src/leads/integrations/lifecycle-replay-contract.spec.ts src/leads/leads.controller.spec.ts src/leads/leads.service.spec.ts`: passed, 3 suites and 40 tests.
- `npm test`: passed, 16 suites and 97 tests.
- `npm run lint`: passed.
- `npx prisma generate`: passed.
- `npx prisma validate`: passed.

Sensitive-data handling: validation used synthetic test values only. No bearer token, service token, JWT payload, raw production lead row, contact value, raw message, confirmation token, private URL, metadata value, raw consent source value, campaign content, or secret value was printed or persisted.

Decision: integration readiness accepted for Goal 25 storage with Goal 24 replay source present. Deployment readiness still requires an owner deployment decision.
