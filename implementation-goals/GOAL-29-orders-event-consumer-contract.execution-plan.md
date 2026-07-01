# Goal 29 Execution Plan

```yaml
id: LEADS-GOAL-29-EXECUTION-PLAN
status: active
owner: orders-rollout-goal-7-4-leads-agent
created: 2026-07-01
last_updated: 2026-07-01
completeness_level: handler-ready-live-broker-blocked
upstream:
  - GOAL-29-orders-event-consumer-contract.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-29-orders-event-consumer-contract.context-package.md
  - GOAL-29-orders-event-consumer-contract.coding-prompt.md
  - GOAL-29-orders-event-consumer-contract.validation-report.md
```

## Selected Goal

Goal 29 - Orders Event Consumer Contract For Leads, selected from the Orders production rollout Goal 7.4 event-consumer lane.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake, confirmation, preference, unsubscribe, and minimized lifecycle evidence service. Orders remains the canonical order lifecycle source of truth.

## Goal Impact

This chunk gives Leads a narrow, testable contract guard for `orders.order.created.v1` without inventing a RabbitMQ runtime layer or duplicating Orders data. It records exactly why runtime consumption is blocked and what Orders/broker facts are needed next.

## Pre-Coding Gate

- Gate: pass-with-blocked-runtime.
- Date: 2026-07-01.
- DocsRAG: queried from the Leads runtime pod without printing token values. HTTP 200 returned no indexed context for the Orders consumer query.
- Orders source verified: `orders.order.created.v1` is published to exchange `orders.events`; current payload is `orderId` and `channel`.
- Leads source verified: no RabbitMQ/amqplib dependency, queue consumer module, or broker env convention is present.
- Runtime consumer decision: blocked until attribution and broker contracts are explicit.

## Invariant Impact

- LEADS-INV-001: preserved; only minimized lead attribution evidence is allowed.
- LEADS-INV-002: strengthened; Orders remains order source of truth.
- LEADS-INV-003: preserved; no consent, confirmation, preference, or unsubscribe semantics change.
- LEADS-INV-004: high impact; tests must prove raw order/customer/payment/address/token data is ignored.
- LEADS-INV-005: preserved; no outreach automation.
- LEADS-INV-006: preserved; public intake unchanged.
- LEADS-INV-007: preserved for future runtime use by requiring an explicit trusted event and idempotency guard.
- LEADS-INV-008: preserved; no notification delivery behavior.
- LEADS-INV-009: preserved; no AI/CRM raw export.
- LEADS-INV-010: satisfied by Goal 29 artifacts and validation evidence.

## Sensitive-Data Classification

Synthetic/minimized only. The contract guard may read an Orders event object in tests but must output only order ID, channel, event ID, event timestamp, lead ID, and source-of-truth markers. It must omit customer, address, payment, token, tracking, contact, raw message, and metadata values.

## Consent Impact

No consent, confirmation, preference, or unsubscribe behavior changes. The future order-attribution lifecycle event must not imply marketing eligibility, campaign approval, contact permission, or outreach permission.

## Contract/Schema Impact

Adds a local TypeScript contract guard and tests only. No public API, internal API, Prisma schema, migration, deployment config, Orders event source, notification contract, marketing contract, AI contract, or CRM contract changes are included.

## Replay/Determinism Impact

Live broker redelivery is not implemented in this chunk. The planned attribution event uses `orders-order-created:<orderId>` as the Leads idempotency key so repeated delivery of the same canonical order-created signal does not create duplicate attribution records.

## Scope

- Goal 29 implementation artifacts.
- Leads-side order-created event contract guard.
- Focused Jest tests for current blocked fixture, future attributed fixture, invalid envelope rejection, sensitive-data omission, and idempotency key stability.
- Orchestrator/status/state updates.

## Non-Goals

- RabbitMQ connection, queue declaration, consumer startup, ack/nack behavior, retry, DLQ, Kubernetes env/config, Vault wiring, deployment, runtime smoke, production event replay, production lead mutation, schema migration, Orders source edit, Marketing edit, Notifications edit, campaign execution, notification dispatch, raw lead export, or AI/CRM enrichment.

## Files To Inspect

- `package.json`
- `src/leads/integrations/lifecycle-events.ts`
- `src/leads/integrations/lifecycle-event-router.service.ts`
- `prisma/schema.prisma`
- `k8s/configmap.yaml`
- `k8s/external-secret.yaml`
- Orders event contract docs/source listed in the context package.

## Files To Modify

- `src/leads/integrations/orders-order-created-consumer-contract.ts`
- `src/leads/integrations/orders-order-created-consumer-contract.spec.ts`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.execution-plan.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.context-package.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.coding-prompt.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.validation-report.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`

## Parallel Execution

- Current lane: integration owner for Leads Goal 29.
- Parallel-ready follow-ups after this lane:
  - Orders contract owner: add or approve a minimized lead attribution field in `orders.order.created.v1` or a companion attribution event.
  - Leads runtime owner: add RabbitMQ consumer wiring only after Orders attribution and broker runtime conventions are approved.
  - Marketing/Notifications owners: separate Goal 7.4 consumer lanes; do not share Leads files.
- Shared surfaces: Orders event contract, RabbitMQ exchange/queue policy, deployment env names.
- Merge order: Orders attribution contract -> Leads runtime consumer -> runtime config/deploy -> replay/backfill validation.
- Validation owner: Leads lane owns contract tests; future runtime owner owns broker smoke and idempotent redelivery evidence.

## Validation Plan

- `npm test -- --runTestsByPath src/leads/integrations/orders-order-created-consumer-contract.spec.ts`
- `npm run build`
- `git diff --check`
- Runtime config check for broker/order-event env names without printing values.

## Rollback Plan

Revert Goal 29 docs/source/test changes before deployment. No schema, migration, runtime config, production data, or deployment changes are included.
