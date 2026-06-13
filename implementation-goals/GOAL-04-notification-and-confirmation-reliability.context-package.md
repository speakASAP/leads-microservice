# Goal 4: Context Package

```yaml
id: LEADS-GOAL-04-CONTEXT-PACKAGE
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete-for-implementation
upstream:
  - GOAL-04-notification-and-confirmation-reliability.execution-plan.md
downstream:
  - GOAL-04-notification-and-confirmation-reliability.coding-prompt.md
```

## Task Summary

Make notification confirmation behavior observable without logging raw recipients, contact details, raw messages, source URL paths/query strings, confirmation tokens, or notification response bodies.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/GOALS.md`
- DocsRAG HTTP 200 context from the Leads runtime pod.

## Relevant Files

- `src/notifications/notifications.service.ts`
- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `package.json`

## Current Behavior

- `NotificationsService.sendLeadConfirmation` sends admin notification failures as non-fatal and returns `false` when submitter confirmation cannot be sent.
- `LeadsController.submitLead` creates the lead before requesting confirmation, so notification failure does not corrupt lead creation state.
- Existing logs include raw contact methods, recipient values, source URLs, and notification response bodies.

## Required Behavior

- Notification payloads remain intact for notifications-microservice.
- Logs expose only metadata such as channel, counts, configured flags, host, and message length.
- Confirmation tokens, raw messages, raw recipients, private source URL paths/query strings, and response bodies are not logged.
- Notifications-microservice remains the delivery owner.

## Constraints

- Use synthetic values only in tests.
- Do not print or persist secrets, real contact details, raw lead rows, confirmation tokens, private URLs, or production payloads.
- Do not run production mutation tests.
- Do not deploy.
- Do not change notification provider credentials or delivery mechanics.

## Known Risks

- Redacting logs can reduce troubleshooting detail. Mitigation: preserve channel, recipient presence, contact method count/types, source host, status, and error message while excluding sensitive payload content.

## Validation Commands

- `npm test -- --runTestsByPath src/notifications/notifications.service.spec.ts`
- `npm run build`
- static log scan for risky notification/submit log patterns
- missing-marker scan over IPS docs
- secret/raw-data scan over changed docs/tests
