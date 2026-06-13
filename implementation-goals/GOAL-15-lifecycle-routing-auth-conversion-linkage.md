# Goal 15 - Lifecycle Routing And Auth Conversion Linkage

```yaml
id: GOAL-15-lifecycle-routing-auth-conversion-linkage
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md
  - GOAL-14-lead-confirmed-preference-lifecycle-adoption.md
downstream:
  - ../src/leads/integrations/lifecycle-event-router.service.ts
  - ../src/leads/dto/link-lead-to-user.dto.ts
  - ../src/leads/leads.controller.ts
  - ../src/leads/leads.service.ts
```

## Intent

Implement the next two owner-selected slices together: consumer-side lifecycle event routing through the existing logging integration, and guarded Auth conversion-link event recording.

## Scope

- Add a lifecycle event router service that maps minimized events to intended internal consumers and records routing metadata through `LoggingService`.
- Refactor existing controller lifecycle recordings to use the router.
- Add a guarded internal Auth conversion-link endpoint that records a minimized `LeadConvertedToUser` lifecycle event after a trusted service asserts verified contact ownership, conversion token validation, or owner-reviewed manual linkage.
- Preserve current schemas and public response shapes.

## Out Of Scope

- No message bus, durable event store, Prisma migration, raw contact reveal, Auth JWT verification, registered-user creation, campaign execution, AI/CRM export, production mutation, or deployment.
- No raw lead data export to Auth.

## Acceptance Criteria

- Lifecycle routing metadata lists intended consumers without raw lead data.
- Existing lifecycle event flows still emit minimized events through the router.
- Auth conversion-link endpoint is guarded by `InternalServiceGuard`.
- Auth conversion-link event contains `leadId`, `userId`, `sourceService`, `linkMethod`, and `linkedAt` only.
- Focused tests and build pass.
