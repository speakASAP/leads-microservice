# Goal 18 - Durable Lifecycle Event Storage

```yaml
id: LEADS-GOAL-18-DURABLE-LIFECYCLE-EVENT-STORAGE
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - docs/orchestrator/INTENT.md
  - docs/orchestrator/GOALS.md
  - implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md
  - implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.md
  - implementation-goals/GOAL-15-lifecycle-routing-auth-conversion-linkage.md
downstream:
  - GOAL-18-durable-lifecycle-event-storage.execution-plan.md
  - GOAL-18-durable-lifecycle-event-storage.context-package.md
  - GOAL-18-durable-lifecycle-event-storage.coding-prompt.md
  - GOAL-18-durable-lifecycle-event-storage.validation-report.md
```

## Selection Decision

Selected next runtime slice: durable lifecycle event storage.

Reason: lifecycle events already have minimized builders, controller adoption, and routing. Persisting those minimized events is the next smallest runtime step that improves replayability, audit evidence, and downstream retrieval without requiring Auth claim-name or tenant-mapping decisions. Auth-backed admin authentication remains important, but source implementation is still blocked until exact Auth JWT/session claim names and tenant scoping semantics are confirmed against Auth source-of-truth contracts.

## Intent

Leads must durably store minimized lifecycle events for non-registered leads so internal consumers can replay or retrieve lifecycle evidence without raw lead export, campaign execution, notification dispatch, CRM workflow ownership, or Auth identity ownership drift.

## Chunks

- [x] 18.1 Select durable lifecycle event storage as the next runtime slice and create execution artifacts.
- [ ] 18.2 Add a Prisma-backed lifecycle event persistence model and migration using minimized event fields only.
- [ ] 18.3 Update `LeadLifecycleEventRouterService` to persist events before logging route metadata.
- [ ] 18.4 Add a guarded lifecycle event retrieval endpoint using the Goal 11 contract.
- [ ] 18.5 Add focused tests for persistence, idempotency, minimized payloads, and retrieval bounds.
- [ ] 18.6 Validate focused tests, full tests, build, Prisma generation/migration checks, documentation scans, and sensitive-data handling.

## Acceptance Criteria

- Durable records store minimized lifecycle event envelopes only.
- Stored payloads omit contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, and campaign content.
- Idempotency prevents duplicate records for the same lifecycle transition.
- Retrieval is guarded by `InternalServiceGuard` and bounded to one lead at a time.
- Public API response shapes are unchanged.
- Logging remains metadata-only and does not become the durable event store owner.
- No Auth login/JWT validation, campaign execution, Notifications dispatch, CRM workflow, AI export, raw lead export, production lead mutation, or deployment is included without separate owner approval.

## Current Non-Selection

Auth-backed admin authentication is not selected for this slice because the existing contract artifact still requires exact Auth claim names, issuer/audience semantics, role claim shape, and tenant/workspace mapping before backend source edits. It should remain the next candidate after Goal 18 or after Auth claim evidence is confirmed.
