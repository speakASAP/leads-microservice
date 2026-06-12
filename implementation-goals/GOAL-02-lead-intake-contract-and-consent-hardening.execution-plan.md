# Goal 2: Execution Plan

```yaml
id: LEADS-GOAL-02-EXECUTION-PLAN
status: active
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete-for-chunk-2.4
upstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.context-package.md
  - GOAL-02-lead-intake-contract-and-consent-hardening.coding-prompt.md
  - GOAL-02-lead-intake-contract-and-consent-hardening.validation-report.md
```

## Selected Goal

Goal 2 - Lead Intake Contract And Consent Hardening, chunk 2.4: record consumer compatibility risks for sgiprealestate, statex, and marketing-microservice.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake service. This chunk records consumer compatibility risks for the hardened public intake contract without exporting raw lead data, changing outreach behavior, or mutating production.

## Goal Impact

The chunk documents consumer-facing migration notes for the validation behavior introduced or confirmed in chunks 2.1 and 2.2. Runtime source edits are not planned.

## Invariant Impact

- `LEADS-INV-001`: affected; public lead intake compatibility is in scope.
- `LEADS-INV-002`: preserved; no ownership change for Auth, Notifications, Marketing, Logging, database infrastructure, or AI.
- `LEADS-INV-003`: affected; compatibility notes must preserve affirmative-consent evidence requirements.
- `LEADS-INV-004`: affected; only contract descriptions and synthetic examples may be used.
- `LEADS-INV-005`: preserved; no mass outreach behavior.
- `LEADS-INV-006`: affected; public intake validation and max-30 contact method bound must be documented for consumers.
- `LEADS-INV-007`: not directly affected; internal service endpoints are out of scope.
- `LEADS-INV-008`: not directly affected; notification delivery mechanics are out of scope.
- `LEADS-INV-009`: not affected; no AI or CRM export.
- `LEADS-INV-010`: affected; status and validation evidence must be updated.

## Sensitive-Data Classification

`none`: this chunk records contract and compatibility documentation only. No production rows, real contacts, secrets, confirmation tokens, private URLs, or raw production payloads may be printed or persisted.

## Consent Impact

This chunk does not change consent semantics. It documents that `marketingConsent: true` requires non-empty `consentSource` and valid ISO8601 `consentCapturedAt`, and that missing or `false` consent remains no affirmative opt-in.

## Contract/Schema Impact

No new Leads contract or schema change is planned. The chunk documents consumer migration notes for the existing public intake validation contract for `POST /api/leads/submit`.

## Replay/Determinism Impact

Documentation updates are deterministic and do not create leads, send notifications, confirm tokens, unsubscribe contacts, or mutate production. No production smoke mutation is allowed.

## Scope

- Inspect current public intake DTO and controller behavior.
- Query DocsRAG for ecosystem/consumer compatibility context.
- Record consumer compatibility risks and migration notes.
- Run focused DTO tests and build.
- Record validation evidence and continuation state.

## Non-Goals

- Registered-user identity or Auth behavior.
- Notification provider mechanics or delivery templates.
- Campaign execution or mass outreach.
- Raw production lead export.
- Secrets or decoded runtime configuration.
- Increased list limits or timeouts.
- Database migrations.
- Deployment.

## Files To Inspect

- `src/leads/dto/create-lead.dto.ts`
- `src/leads/dto/create-lead.dto.spec.ts`
- `package.json`

## Files To Modify

Allowed for chunk 2.4 after the gate passes:

- `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.md`
- `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.execution-plan.md`
- `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.context-package.md`
- `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.coding-prompt.md`
- `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.validation-report.md`
- `docs/orchestrator/STATUS.md`
- `docs/orchestrator/GOALS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`

## Validation Plan

- `git status --short --branch` to capture remote worktree state.
- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts` for focused DTO validation.
- `npm run build` for TypeScript/backend validation.
- Missing-marker scan over IPS docs.
- Secret/raw-data scan over changed docs/tests.

## Rollback Plan

For documentation-only completion evidence, restore the previous docs with a targeted patch and append a correction entry to status. If tests are edited, use a targeted patch that restores prior focused DTO tests while preserving unrelated changes.

## Pre-Coding Gate Evidence

Gate: Leads pre-coding gate
Date: 2026-06-12
Goal: Goal 2 - Lead Intake Contract And Consent Hardening
Chunk: 2.4
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: existing IPS docs, JWT runtime wiring, and chunk 2.1/2.2 changes are uncommitted on `main`; preserve existing changes.
DocsRAG query: passed from inside the Leads runtime pod using runtime `JWT_TOKEN`; HTTP 200 for query "Leads Goal 2 chunk 2.4 consumer compatibility risks sgiprealestate statex marketing-microservice public lead submit consent contact methods".
Execution plan: this file.
Context package: `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.context-package.md`.
Coding prompt: `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.coding-prompt.md`.
Invariants checked: `LEADS-INV-001` through `LEADS-INV-010` above.
Sensitive-data classification: `none`.
Consent impact: compatibility documentation only; no consent semantics change.
Contract/schema impact: no new contract or schema change; documents consumer migration notes for the existing public intake DTO contract.
AI/CRM export impact: no AI/CRM export.
Outreach impact: no outreach automation.
Validation commands: focused DTO test, build, missing-marker scan, secret/raw-data scan.
Result: pass; documentation may be updated and runtime source must remain unchanged.
