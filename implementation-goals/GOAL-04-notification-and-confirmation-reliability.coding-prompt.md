# Goal 4: Coding Prompt

```yaml
id: LEADS-GOAL-04-CODING-PROMPT
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete-for-implementation
upstream:
  - GOAL-04-notification-and-confirmation-reliability.context-package.md
  - GOAL-04-notification-and-confirmation-reliability.execution-plan.md
downstream:
  - GOAL-04-notification-and-confirmation-reliability.validation-report.md
```

## Task Summary

Implement Goal 4: make lead confirmation notification behavior reliable, observable, and privacy-safe while preserving notifications-microservice ownership.

## Required Context

Read the selected goal, execution plan, context package, pre-coding gate, notification service, lead controller, and lead service before source edits.

## Allowed Changes

- `src/notifications/notifications.service.ts`
- `src/notifications/notifications.service.spec.ts`
- `src/leads/leads.controller.ts`
- Goal 4 validation/status/continuation docs listed in the execution plan.

## Forbidden Changes

- Do not export raw lead data.
- Do not trigger mass outreach.
- Do not weaken consent, confirmation, preference, or unsubscribe evidence.
- Do not alter Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.
- Do not print or persist secrets, real contact details, confirmation tokens, or raw production lead rows.
- Do not deploy without owner approval.

## Implementation Instructions

1. Run and record the pre-coding gate.
2. Stay inside the execution-plan scope.
3. Redact notification and lead submit logs while preserving observability metadata.
4. Preserve admin failure as non-fatal and submitter failure as `false`.
5. Add focused notification service tests for missing URL, admin failure, submitter failure, and log redaction.
6. Run focused tests and build.
7. Update validation report, orchestrator status, and continuation state.

## Acceptance Criteria

- Confirmation behavior is reliable and observable.
- Notification failures do not corrupt lead creation state.
- Tokens and raw messages are not leaked in logs or validation reports.
- Notifications remain notifications-microservice-owned.
- Focused tests and build pass.

## Validation Commands

- `npm test -- --runTestsByPath src/notifications/notifications.service.spec.ts`
- `npm run build`
