# Goal 4: Execution Plan

```yaml
id: LEADS-GOAL-04-EXECUTION-PLAN
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete-for-implementation
upstream:
  - GOAL-04-notification-and-confirmation-reliability.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-04-notification-and-confirmation-reliability.context-package.md
  - GOAL-04-notification-and-confirmation-reliability.coding-prompt.md
  - GOAL-04-notification-and-confirmation-reliability.validation-report.md
```

## Selected Goal

Goal 4 - Notification And Confirmation Reliability: review the notifications-microservice call contract and error handling, prevent token/raw-message leakage in logs, add focused failure behavior tests, and document the notification ownership boundary.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake service. It may request confirmation notifications, but notifications-microservice owns outbound delivery mechanics and provider credentials.

## Goal Impact

Current notification logs include raw contact method values, raw recipient values, source URLs, and notification response bodies. This goal tightens logs to observable metadata while preserving notification payloads and failure behavior.

## Invariant Impact

- `LEADS-INV-001`: affected; lead confirmation state remains Leads-owned.
- `LEADS-INV-002`: preserved; Notifications remains the delivery owner.
- `LEADS-INV-003`: preserved; no consent semantics change.
- `LEADS-INV-004`: affected; raw contact details, source URLs, messages, confirmation tokens, and response bodies must not appear in logs/tests/docs.
- `LEADS-INV-005`: preserved; no mass outreach behavior.
- `LEADS-INV-006`: not directly affected; public intake/query bounds are out of scope.
- `LEADS-INV-007`: not directly affected; internal-service headers are out of scope.
- `LEADS-INV-008`: affected; Leads requests confirmation sends but does not own delivery mechanics or notification provider credentials.
- `LEADS-INV-009`: not affected; no AI or CRM export.
- `LEADS-INV-010`: affected; status and validation evidence must be updated.

## Sensitive-Data Classification

`synthetic`: tests use fake contact values, messages, source URLs, and confirmation tokens only. No production rows, real contacts, raw messages, secrets, confirmation tokens, private URLs, or production payloads may be printed or persisted.

## Consent Impact

No consent semantics change.

## Contract/Schema Impact

No notifications-microservice payload contract or schema change. Leads still calls `POST /notifications/send` through `NOTIFICATION_SERVICE_URL`. Logs are redacted to avoid raw recipients, contact details, source URL paths/query strings, raw messages, confirmation tokens, and notification response bodies.

## Replay/Determinism Impact

Focused tests mock notifications-microservice and do not create leads, send notifications, confirm tokens, unsubscribe contacts, or mutate production.

## Scope

- Redact local lead submit and notification logs.
- Preserve admin notification failure as non-fatal.
- Preserve submitter confirmation failure returning `false`.
- Add focused notification service tests for missing URL, admin failure, submitter failure, and log redaction.
- Update Goal 4 artifacts, status, and continuation state.

## Non-Goals

- Notification provider mechanics or credentials.
- Campaign execution or mass outreach.
- Registered-user identity or Auth behavior.
- Raw production lead export.
- Secrets or decoded runtime configuration.
- Increased timeouts or list limits.
- Database migrations.
- Deployment.

## Files To Inspect

- `src/notifications/notifications.service.ts`
- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `package.json`

## Files To Modify

- `src/notifications/notifications.service.ts`
- `src/notifications/notifications.service.spec.ts`
- `src/leads/leads.controller.ts`
- `implementation-goals/GOAL-04-notification-and-confirmation-reliability.md`
- `implementation-goals/GOAL-04-notification-and-confirmation-reliability.execution-plan.md`
- `implementation-goals/GOAL-04-notification-and-confirmation-reliability.context-package.md`
- `implementation-goals/GOAL-04-notification-and-confirmation-reliability.coding-prompt.md`
- `implementation-goals/GOAL-04-notification-and-confirmation-reliability.validation-report.md`
- `implementation-goals/README.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`

## Validation Plan

- `git status --short --branch` to capture remote worktree state.
- `npm test -- --runTestsByPath src/notifications/notifications.service.spec.ts` for focused notification reliability/privacy coverage.
- `npm run build` for TypeScript/backend validation.
- Static scan for risky notification/submit log patterns.
- Missing-marker scan over IPS docs.
- Secret/raw-data scan over changed docs/tests.

## Rollback Plan

Use a targeted patch that restores the previous logging statements and removes the focused notification spec, then append a correction entry to status. Preserve unrelated existing worktree changes.

## Pre-Coding Gate Evidence

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 4 - Notification And Confirmation Reliability
Chunk: 4.1, 4.2, 4.3, 4.4
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: clean on `main` before Goal 4 source edits.
DocsRAG query: passed from inside the Leads runtime pod using runtime `JWT_TOKEN`; HTTP 200 for query "Leads Goal 4 notification confirmation reliability notifications-microservice contract token leakage failure behavior ownership boundary".
Execution plan: this file.
Context package: `implementation-goals/GOAL-04-notification-and-confirmation-reliability.context-package.md`.
Coding prompt: `implementation-goals/GOAL-04-notification-and-confirmation-reliability.coding-prompt.md`.
Invariants checked: `LEADS-INV-001` through `LEADS-INV-010` above.
Sensitive-data classification: `synthetic`.
Consent impact: no consent semantics change.
Contract/schema impact: no notifications payload contract or schema change; local logs are redacted.
AI/CRM export impact: no AI/CRM export.
Outreach impact: no outreach automation.
Validation commands: focused notification test, build, static log scan, missing-marker scan, secret/raw-data scan.
Result: pass; source edits may proceed inside the listed scope.
