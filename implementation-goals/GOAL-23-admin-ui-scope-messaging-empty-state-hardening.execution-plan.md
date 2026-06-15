# Goal 23: Execution Plan

```yaml
id: LEADS-GOAL-23-EXECUTION-PLAN
status: pass-with-documented-risk
owner: Agent B
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: pre-coding-gate-passed
upstream:
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.context-package.md
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.coding-prompt.md
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.validation-report.md
```

## Selected Goal

Goal 23 - Admin UI Scope Messaging And Empty-State Hardening.

Chunks:

- 23.1 Create execution artifacts and pass the pre-coding gate.
- 23.2 Add scoped-empty, hidden-detail, unauthorized, and token-missing UI states.
- 23.3 Add focused UI tests or browser validation for those states.
- 23.4 Validate build, lint/tests, screenshots, and sensitive-data scans.

## Preserved Intent

Leads remains a consent-aware lead intake and preference service. The admin browser may display only minimized, masked admin fields and must not reveal raw lead contact values, raw messages, confirmation tokens, private path/query values, metadata values, tokens, or secret material.

## Goal Impact

This chunk improves operator messaging for safe admin states without changing API contracts, schema, Auth behavior, outreach behavior, AI/CRM behavior, notification delivery, logging ownership, or deployment.

## Invariant Impact

- Raw lead data boundary: UI must not render raw contact values, messages, tokens, private URL path/query values, metadata values, or secrets.
- Auth boundary: UI may describe access failure but must not expose Auth validation internals.
- Scope boundary: empty scoped reads and hidden details must not disclose whether data exists outside the current admin view.
- Consent boundary: consent/preference labels remain informational only and do not change consent semantics.

## Sensitive-Data Classification

`synthetic` for tests and browser validation. Runtime screenshots, if captured, must use unauthenticated, synthetic, or masked data only.

## Consent Impact

No consent, confirmation, preference, unsubscribe, or marketing eligibility semantics change. The UI only renders existing minimized consent state fields.

## Contract/Schema Impact

No public API, internal API, database schema, logging contract, notification contract, AI/CRM contract, Auth contract, or deployment config change. The UI consumes the existing Goal 20 admin list/detail response shape.

## Replay/Determinism Impact

No duplicate lead, notification, confirmation, unsubscribe, retry, or idempotency impact. Static browser rendering is deterministic for the same mocked API responses.

## Scope

Included behavior:

- Token-missing state before admin fetch.
- Unauthorized/forbidden state for HTTP 401 and 403 without response body exposure.
- Scoped-empty state for successful list reads with zero visible rows.
- Hidden-detail state for HTTP 404 detail reads without implying another workspace exists.
- Focused UI tests using synthetic data.

## Non-Goals

- No API, schema, Auth, Notifications, Marketing, Logging, AI/CRM, outreach, deployment, or production data mutation changes.
- No raw lead export or production lead screenshots.
- No owner decision on workspace token validation; Goal 22 owns that track.

## Files To Inspect

- `AGENTS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `public/admin.html`
- `public/admin.js`
- `public/styles.css`
- `src/leads/admin-leads.controller.ts`
- `src/leads/leads.service.ts`
- `package.json`

## Files To Modify

- `implementation-goals/GOAL-23-admin-ui-scope-messaging-empty-state-hardening.md`
- `implementation-goals/GOAL-23-admin-ui-scope-messaging-empty-state-hardening.execution-plan.md`
- `implementation-goals/GOAL-23-admin-ui-scope-messaging-empty-state-hardening.context-package.md`
- `implementation-goals/GOAL-23-admin-ui-scope-messaging-empty-state-hardening.coding-prompt.md`
- `implementation-goals/GOAL-23-admin-ui-scope-messaging-empty-state-hardening.validation-report.md`
- `public/admin.js`
- `public/styles.css`
- `public/admin.spec.ts`
- `docs/orchestrator/STATUS.md` append-only evidence
- `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and `STATE.json` only if goal state changes after validation

## Validation Plan

- `npm test -- --runTestsByPath public/admin.spec.ts`
- `npm run build`
- `npm run lint`
- Sensitive-data scan across Goal 23 files and admin UI static assets.
- Optional unauthenticated browser/manual validation only if it can avoid secrets and production lead rows.

## Gate Evidence

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 23 - Admin UI Scope Messaging And Empty-State Hardening
Chunk: 23.1 through 23.4
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: dirty before this worker; unrelated changes already present in shared docs and backend files.
DocsRAG query: attempted in-cluster from Leads runtime pod for Goal 23 admin UI state handling; returned HTTP 500 with no token printed. Plain SSH shell does not expose JWT_TOKEN. Repo-local source-of-truth docs used.
Execution plan: this file
Context package: `GOAL-23-admin-ui-scope-messaging-empty-state-hardening.context-package.md`
Coding prompt: `GOAL-23-admin-ui-scope-messaging-empty-state-hardening.coding-prompt.md`
Invariants checked: raw lead data, Auth boundary, scope boundary, consent boundary
Sensitive-data classification: synthetic
Consent impact: no semantic change
Contract/schema impact: no API/schema/Auth contract change
AI/CRM export impact: none
Outreach impact: none
Validation commands: listed above
Result: pass-with-documented-risk because DocsRAG retrieval returned HTTP 500; risk is non-blocking for this narrow static UI task.

## Rollback Plan

Revert only Goal 23-owned files to their prior contents and append rollback evidence to the validation report/status. Do not revert unrelated dirty worktree changes.
