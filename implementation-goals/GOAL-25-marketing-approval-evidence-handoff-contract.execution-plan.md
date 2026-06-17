# Goal 25 - Marketing Approval Evidence Handoff Contract: Execution Plan

```yaml
id: LEADS-GOAL-25-EXECUTION-PLAN
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: execution-ready
upstream:
  - GOAL-25-marketing-approval-evidence-handoff-contract.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-25-marketing-approval-evidence-handoff-contract.context-package.md
  - GOAL-25-marketing-approval-evidence-handoff-contract.coding-prompt.md
  - GOAL-25-marketing-approval-evidence-handoff-contract.validation-report.md
```

## Selected Goal

Goal 25 - Marketing Approval Evidence Handoff Contract, chunks 1-4: create execution artifacts, define approval evidence fields/purpose/retention/audit summaries, add focused tests, and validate build/scans.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake, consent, preference, confirmation, unsubscribe, and guarded contact-resolution owner. Marketing remains the campaign approval, campaign content, audience review, campaign execution, and approval-storage owner.

## Goal Impact

This chunk strengthens the handoff from Marketing to Leads before campaign contact resolution by making approval evidence structured and audit-safe. It does not add campaign execution, approval storage, outbound send behavior, or raw export.

## Invariant Impact

- LEADS-INV-001: preserved; only Leads-owned contact resolution checks are updated.
- LEADS-INV-002: preserved; Marketing keeps campaign approval/storage/execution ownership.
- LEADS-INV-003: strengthened; campaign contact resolution continues to require consent evidence and no unsubscribe state through eligibility re-check.
- LEADS-INV-004: strengthened; approval summaries omit contact values, campaign content, raw messages, private URLs, tokens, raw consent source values, and metadata values.
- LEADS-INV-005: strengthened; no campaign send or bulk notification path is added.
- LEADS-INV-006: preserved; no public intake/list bound change.
- LEADS-INV-007: preserved; existing internal guard remains required.
- LEADS-INV-008: preserved; no campaign Notifications dispatch is added.
- LEADS-INV-009: preserved; no AI/CRM raw export is added.
- LEADS-INV-010: evidence recorded in this plan, validation report, and STATUS.

## Sensitive-Data Classification

`synthetic`: tests use synthetic IDs, contact values, and content-like strings to prove omissions. No production rows, real contacts, secrets, tokens, private URLs, or campaign content are captured.

## Consent Impact

Campaign contact resolution must still pass marketing eligibility: affirmative marketing consent, consent source presence, consent captured timestamp presence, no unsubscribe state, requested channel support, and confirmation when required.

## Contract/Schema Impact

- Runtime DTO contract changes for `POST /leads/internal/contact-resolution`: approved campaign sends require structured `approvalEvidence` instead of a loose approval ID alone.
- No Prisma schema, migration, public API, Notifications, Auth, AI, CRM, or deployment contract change.
- Logging remains aggregate and audit-safe.

## Replay/Determinism Impact

No durable writes or replay behavior are added. Approval evidence summary building is deterministic from request fields. Eligibility re-check remains deterministic over current Leads state.

## Scope

- Add Marketing approval evidence constants, types, validation, and audit-safe summary builder.
- Wire contact-resolution DTO and service checks to structured approval evidence.
- Add focused tests for missing evidence, channel mismatch, single-channel campaign resolution, eligibility re-check, and sensitive-data omission.
- Append validation evidence to shared status docs.

## Non-Goals

No campaign execution, mass outreach, approval persistence in Leads, raw contact export, AI/CRM export, schema migration, production mutation, or deployment.

## Files To Inspect

- `AGENTS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/orchestrator/*`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md`
- `implementation-goals/GOAL-16-marketing-campaign-eligibility-preview.md`
- `implementation-goals/GOAL-17-controlled-contact-resolution.md`
- `src/leads/dto/contact-resolution.dto.ts`
- `src/leads/leads.service.ts`
- `src/leads/leads.service.spec.ts`
- `src/leads/leads.controller.spec.ts`

## Files To Modify

- `implementation-goals/GOAL-25-marketing-approval-evidence-handoff-contract.md`
- `implementation-goals/GOAL-25-marketing-approval-evidence-handoff-contract.execution-plan.md`
- `implementation-goals/GOAL-25-marketing-approval-evidence-handoff-contract.context-package.md`
- `implementation-goals/GOAL-25-marketing-approval-evidence-handoff-contract.coding-prompt.md`
- `implementation-goals/GOAL-25-marketing-approval-evidence-handoff-contract.validation-report.md`
- `src/leads/integrations/marketing-approval-evidence.ts`
- `src/leads/integrations/marketing-approval-evidence.spec.ts`
- `src/leads/dto/contact-resolution.dto.ts`
- `src/leads/leads.service.ts`
- `src/leads/leads.service.spec.ts`
- `src/leads/leads.controller.spec.ts`
- `docs/orchestrator/STATUS.md`

## Pre-Coding Gate Evidence

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 25 - Marketing Approval Evidence Handoff Contract
Chunk: 1-4
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: dirty before this agent; unrelated shared docs/source changes present and preserved
DocsRAG query: attempted from in-cluster Leads runtime pod; HTTP 500, content unavailable
Execution plan: this file
Context package: `GOAL-25-marketing-approval-evidence-handoff-contract.context-package.md`
Coding prompt: `GOAL-25-marketing-approval-evidence-handoff-contract.coding-prompt.md`
Invariants checked: LEADS-INV-001 through LEADS-INV-010
Sensitive-data classification: synthetic
Consent impact: preserves affirmative consent evidence and unsubscribe checks before campaign contact resolution
Contract/schema impact: internal contact-resolution DTO contract tightened; no schema/migration change
AI/CRM export impact: none
Outreach impact: no campaign execution, no send, no Notifications dispatch
Validation commands: focused Jest tests, `npm run build`, missing-marker scan, secret-pattern scan
Result: pass-with-documented-risk because DocsRAG retrieval returned HTTP 500, while repo-local source contracts are sufficient for this narrow assigned track

## Validation Plan

- `npm test -- --runTestsByPath src/leads/integrations/marketing-approval-evidence.spec.ts src/leads/leads.service.spec.ts src/leads/leads.controller.spec.ts`
- `npm run build`
- `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`
- secret-pattern scan across docs, AGENTS, TASKS, implementation-goals, and touched Goal 25 source/tests

## Rollback Plan

Revert only the Goal 25 files and the structured approval-evidence DTO/service/test changes from this session; preserve appended status evidence and unrelated dirty-tree changes.

## 2026-06-15 Follow-Up Execution Plan

Selected follow-up: Leads-owned minimized approval evidence storage.

Owner approval evidence:

- Source delegation states owner approves remaining tasks, including deciding Goal 25 approval storage ownership.
- Interpretation: Leads may add a dedicated minimized approval-evidence reference store, but Marketing retains campaign approval/content/execution ownership.

Scope:

- Prisma schema and migration for `LeadMarketingApprovalEvidence`.
- Approval-evidence helper validation/storage builder.
- Contact-resolution service persistence after approval validation and eligibility re-check.
- Focused helper/service tests and migration/schema validation.
- Goal 25 artifacts and shared status evidence.

Invariant impact:

- LEADS-INV-001: preserved; table is Lead-related audit evidence for guarded contact resolution only.
- LEADS-INV-002: preserved; Marketing remains campaign approval record, campaign content, audience decision, execution, and delivery-outcome owner.
- LEADS-INV-003: strengthened; storage happens only after existing campaign eligibility re-check.
- LEADS-INV-004: strengthened; storage omits contact values, raw messages, tokens, private URLs, raw consent source values, metadata values, approver value, workspace value, and content-version value.
- LEADS-INV-005: preserved; no sends, loops, campaign execution, or Notifications dispatch.
- LEADS-INV-006: unaffected; no public intake/list bound change.
- LEADS-INV-007: preserved; existing guarded contact-resolution route remains the entry point.
- LEADS-INV-008: unaffected; no Notifications behavior.
- LEADS-INV-009: unaffected; no AI/CRM export.
- LEADS-INV-010: evidence recorded in validation report and `docs/orchestrator/STATUS.md`.

Sensitive-data classification: synthetic tests only; no production lead rows, real contact values, raw messages, confirmation tokens, JWTs, private URLs, raw consent sources, metadata values, or secrets.

Consent impact: preserves consent semantics by writing only after approval evidence validation and the existing campaign eligibility re-check.

Contract/schema impact: adds one Prisma model/table and migration. Internal contact-resolution response contract remains unchanged.

Replay/determinism impact: deterministic idempotency key prevents duplicate audit rows for retry of the same lead/approval/campaign/channel/approval timestamp.

Parallel execution:

- Workstream: Goal 25 migration-owner lane.
- Status: ready in this worker; final integration gated by Goal 24 build health.
- Shared files/contracts: Prisma schema/migration, `LeadsService`, approval-evidence helper.
- Integration owner: source coordinator thread.
- Validation owner: source coordinator thread for final full build/test/deploy readiness.
- Merge order: resolve Goal 24 build blocker first if still present, then merge Goal 25 migration/storage, then final integration validation. Goal 24 must not add competing schema work.

Validation plan:

- `npm run prisma:generate`
- `npm test -- --runTestsByPath src/leads/integrations/marketing-approval-evidence.spec.ts src/leads/leads.service.spec.ts src/leads/leads.controller.spec.ts`
- `npx prisma validate`
- `npm run build`
- missing-marker and secret-pattern scans
