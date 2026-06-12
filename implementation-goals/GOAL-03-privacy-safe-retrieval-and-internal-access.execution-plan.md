# Goal 3: Execution Plan

```yaml
id: LEADS-GOAL-03-EXECUTION-PLAN
status: active
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete-for-implementation
upstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.context-package.md
  - GOAL-03-privacy-safe-retrieval-and-internal-access.coding-prompt.md
  - GOAL-03-privacy-safe-retrieval-and-internal-access.validation-report.md
```

## Selected Goal

Goal 3 - Privacy-Safe Retrieval And Internal Access: audit raw retrieval and internal preference endpoints, add access controls for non-public retrieval, preserve max-30 list bounds, and validate trusted internal-service headers.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake and preference service. Retrieval paths must not expose raw lead messages, contact details, submitted payloads, or preference state to public callers.

## Goal Impact

Current `GET /api/leads` and `GET /api/leads/:id` return raw lead data and are unguarded. This goal changes those retrieval paths to require the existing `InternalServiceGuard`, while keeping public lead intake and confirmation behavior public.

## Invariant Impact

- `LEADS-INV-001`: affected; lead records and contact methods remain Leads-owned.
- `LEADS-INV-002`: preserved; no ownership change for Auth, Notifications, Marketing, Logging, database infrastructure, or AI.
- `LEADS-INV-003`: affected; preference and consent fields remain available only through controlled retrieval paths.
- `LEADS-INV-004`: affected; raw lead data retrieval is protected and tests use synthetic values only.
- `LEADS-INV-005`: preserved; no mass outreach behavior.
- `LEADS-INV-006`: affected; list queries must remain bounded at 30 items.
- `LEADS-INV-007`: affected; non-public retrieval and preference paths must use trusted internal-service headers.
- `LEADS-INV-008`: not directly affected; notification delivery mechanics are out of scope.
- `LEADS-INV-009`: not affected; no AI or CRM export.
- `LEADS-INV-010`: affected; status and validation evidence must be updated.

## Sensitive-Data Classification

`synthetic`: tests use fake IDs and mocked Prisma responses only. No production rows, real contacts, raw messages, secrets, confirmation tokens, private URLs, or production payloads may be printed or persisted.

## Consent Impact

No consent semantics change. Access to stored consent and preference fields is tightened by requiring trusted internal-service credentials for raw list/detail retrieval.

## Contract/Schema Impact

Public contract change: `GET /api/leads` and `GET /api/leads/:id` become trusted internal-service routes and require `x-internal-service-token` plus `x-service-name` accepted by `InternalServiceGuard`. `POST /api/leads/submit` and `GET /api/leads/confirm/:token` remain public. Internal preference and unsubscribe paths keep their existing guarded contract. No schema change.

## Replay/Determinism Impact

Validation is unit-level and deterministic. It does not create leads, send notifications, confirm tokens, unsubscribe contacts, or mutate production.

## Scope

- Add `InternalServiceGuard` to raw list/detail retrieval controller methods.
- Add controller metadata tests for guarded retrieval and internal routes.
- Add focused service tests proving list retrieval clamps to 30 items.
- Extend guard tests for missing trusted-service headers.
- Update Goal 3 artifacts, status, and continuation state.

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

- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/dto/lead-query.dto.ts`
- `src/leads/dto/update-lead-preferences.dto.ts`
- `src/leads/guards/internal-service.guard.ts`
- `src/leads/guards/internal-service.guard.spec.ts`
- `package.json`

## Files To Modify

- `src/leads/leads.controller.ts`
- `src/leads/leads.controller.spec.ts`
- `src/leads/leads.service.spec.ts`
- `src/leads/guards/internal-service.guard.spec.ts`
- `implementation-goals/GOAL-03-privacy-safe-retrieval-and-internal-access.md`
- `implementation-goals/GOAL-03-privacy-safe-retrieval-and-internal-access.execution-plan.md`
- `implementation-goals/GOAL-03-privacy-safe-retrieval-and-internal-access.context-package.md`
- `implementation-goals/GOAL-03-privacy-safe-retrieval-and-internal-access.coding-prompt.md`
- `implementation-goals/GOAL-03-privacy-safe-retrieval-and-internal-access.validation-report.md`
- `implementation-goals/README.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`

## Validation Plan

- `git status --short --branch` to capture remote worktree state.
- `npm test -- --runTestsByPath src/leads/leads.controller.spec.ts src/leads/leads.service.spec.ts src/leads/guards/internal-service.guard.spec.ts` for access/bounds/header coverage.
- `npm run build` for TypeScript/backend validation.
- Missing-marker scan over IPS docs.
- Secret/raw-data scan over changed docs/tests.

## Rollback Plan

Use a targeted patch that removes the new guards from raw retrieval methods and removes the focused tests, then append a correction entry to status. Preserve unrelated existing worktree changes.

## Pre-Coding Gate Evidence

Gate: Leads pre-coding gate
Date: 2026-06-12
Goal: Goal 3 - Privacy-Safe Retrieval And Internal Access
Chunk: 3.1, 3.2, 3.3, 3.4
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: existing IPS docs, JWT runtime wiring, Goal 2 changes, and DTO hardening changes are uncommitted on `main`; preserve existing changes.
DocsRAG query: passed from inside the Leads runtime pod using runtime `JWT_TOKEN`; HTTP 200 for query "Leads Goal 3 privacy safe retrieval internal access GET leads list detail internal preference trusted service headers max 30".
Execution plan: this file.
Context package: `implementation-goals/GOAL-03-privacy-safe-retrieval-and-internal-access.context-package.md`.
Coding prompt: `implementation-goals/GOAL-03-privacy-safe-retrieval-and-internal-access.coding-prompt.md`.
Invariants checked: `LEADS-INV-001` through `LEADS-INV-010` above.
Sensitive-data classification: `synthetic`.
Consent impact: no semantics change; retrieval access is tightened.
Contract/schema impact: raw list/detail retrieval now requires trusted internal-service headers; no schema change.
AI/CRM export impact: no AI/CRM export.
Outreach impact: no outreach automation.
Validation commands: focused controller/service/guard tests, build, missing-marker scan, secret/raw-data scan.
Result: pass; source edits may proceed inside the listed scope.
