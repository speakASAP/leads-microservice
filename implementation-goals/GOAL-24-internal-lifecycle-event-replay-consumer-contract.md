# Goal 24 - Internal Lifecycle Event Replay Consumer Contract

## Status

complete - runtime replay consumer path for FlipFlop added on 2026-06-15

## Vision

Leads remains the consent-aware non-registered lead intake and minimized lifecycle evidence owner. Trusted internal consumers may replay Leads-owned lifecycle evidence, but Leads must not become the centralized logging store or expose raw lead data.

## Goal Impact

Goal 24 defines a bounded replay contract over already persisted minimized lifecycle events. It gives future runtime route work a stable contract and tests without adding a route, storage, migration, production mutation, campaign execution, notification dispatch, AI export, CRM workflow, or logging ownership.

## System

- Existing source: minimized lifecycle builders and persisted `LeadLifecycleEvent` records.
- Future runtime guard expectation: `InternalServiceGuard`; no public replay stream is approved.
- Logging remains the centralized log owner. Leads serves only its own minimized lifecycle evidence.

## Feature

Internal lifecycle replay contract for trusted consumers:

- one-lead scoped by `leadId`;
- consumer-scoped by declared lifecycle route membership;
- bounded to `MAX_LIFECYCLE_REPLAY_EVENTS = 30`;
- deterministic ordering by event occurrence and event ID;
- payloads rebuilt through event-type allowlists;
- explicit evidence/log owner fields in the contract.

## Task

- [x] 24.1 Create execution artifacts and pass the pre-coding gate.
- [x] 24.2 Define replay request/response contract and consumer constraints.
- [x] 24.3 Add minimized contract builders and focused tests.
- [x] 24.4 Validate build, tests, determinism, and sensitive-data scans.
- [x] 24.5 Add guarded runtime replay route for owner-selected first consumer `flipflop-service`.

## Execution Plan

See `GOAL-24-internal-lifecycle-event-replay-consumer-contract.execution-plan.md`.

## Coding Prompt

See `GOAL-24-internal-lifecycle-event-replay-contract.coding-prompt.md`.

## Code

- `src/leads/integrations/lifecycle-replay-contract.ts`
- `src/leads/integrations/lifecycle-replay-contract.spec.ts`

Runtime route added: `GET /api/leads/internal/:id/lifecycle-replay`, guarded by `InternalServiceGuard`, accepting only `consumer=flipflop-service`. No schema, migration, deployment config, raw lead export, campaign execution, notification dispatch, AI/CRM export, or production data changes are included.

## Validation

See `GOAL-24-internal-lifecycle-event-replay-consumer-contract.validation-report.md`.
