# Goal 13 - LeadSubmitted Lifecycle Event Adoption

```yaml
id: LEADS-GOAL-13-LEAD-SUBMITTED-LIFECYCLE-ADOPTION
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
  - GOAL-12-lifecycle-product-app-contract-builders.md
downstream:
  - GOAL-13-lead-submitted-lifecycle-adoption.execution-plan.md
  - GOAL-13-lead-submitted-lifecycle-adoption.context-package.md
  - GOAL-13-lead-submitted-lifecycle-adoption.coding-prompt.md
  - GOAL-13-lead-submitted-lifecycle-adoption.validation-report.md
```

## Intent

Adopt the minimized `LeadSubmitted` lifecycle event builder in the local public intake flow without changing public API responses, schemas, campaign behavior, notification delivery, product apps, AI, CRM, or deployment.

## Completed Chunks

- [x] 13.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 13.2 Record a minimized `LeadSubmitted` lifecycle event after successful lead creation through the existing logging integration.
- [x] 13.3 Add focused controller tests proving the lifecycle log payload is minimized.
- [x] 13.4 Validate focused tests, build, documentation scans, and sensitive-data handling.

## Scope

Changed source files:

- `src/leads/leads.controller.ts`
- `src/leads/leads.controller.spec.ts`

## Non-Goals

- No public response change.
- No route or controller endpoint addition.
- No Prisma schema or migration.
- No event emitter or message bus.
- No campaign execution.
- No notification send behavior change.
- No product-app repository edits.
- No AI export, CRM export, raw lead export, production read, production mutation, or deployment.

## Result

`POST /api/leads/submit` now builds a minimized `LeadSubmitted` lifecycle event after lead creation and records it via `LoggingService` as metadata under the existing logging boundary. The event omits contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, and consent source values.
