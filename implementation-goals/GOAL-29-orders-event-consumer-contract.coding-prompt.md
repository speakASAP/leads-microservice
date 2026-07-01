# Goal 29 Coding Prompt

```yaml
id: LEADS-GOAL-29-CODING-PROMPT
status: active
owner: orders-rollout-goal-7-4-leads-agent
created: 2026-07-01
last_updated: 2026-07-01
completeness_level: contract-ready-runtime-blocked
upstream:
  - GOAL-29-orders-event-consumer-contract.context-package.md
  - GOAL-29-orders-event-consumer-contract.execution-plan.md
downstream:
  - GOAL-29-orders-event-consumer-contract.validation-report.md
```

## Task Summary

Implement the Leads-side contract guard for the Orders production rollout Goal 7.4 event-consumer lane. Do not wire a runtime RabbitMQ consumer until the broker runtime convention and order-to-lead attribution contract are explicit.

## Required Context

Read:

- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.execution-plan.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.context-package.md`
- Orders source-of-truth event docs/source:
  - `/home/ssf/Documents/Github/orders-microservice/docs/orchestrator/ORDER_EVENT_CONTRACTS.md`
  - `/home/ssf/Documents/Github/orders-microservice/src/orders/order-event-contracts.ts`
  - `/home/ssf/Documents/Github/orders-microservice/docs/orchestrator/event-fixtures/orders.order.created.v1.json`

## Allowed Changes

- Add a TypeScript contract/guard module under `src/leads/integrations/`.
- Add focused Jest tests with synthetic order and lead identifiers only.
- Update Goal 29 artifacts and orchestrator/status docs.

## Forbidden Changes

- Do not add RabbitMQ/amqplib runtime dependencies or queue consumers in this chunk.
- Do not edit Orders, Marketing, Notifications, Warehouse, Catalog, marketplace services, or deployment config.
- Do not add Prisma schema or migrations.
- Do not store full order snapshots, customer objects, addresses, payment fields, tracking fields, contact values, raw lead messages, confirmation tokens, JWTs, service tokens, or secrets.
- Do not infer lead attribution from channel, contact values, customer data, or metadata.
- Do not deploy.

## Implementation Instructions

1. Add a contract guard for `orders.order.created.v1`.
2. Require the canonical Orders envelope: `type`, `eventVersion`, `eventId`, `occurredAt`, `source`, and minimized `payload`.
3. Treat the currently emitted Orders payload as blocked for Leads attribution because it contains only `orderId` and `channel`.
4. Define the future minimum attribution key as `payload.leadAttribution.leadId`.
5. When attribution is present, build a minimized Leads lifecycle event candidate with only:
   - lead ID;
   - order ID;
   - order channel;
   - Orders event ID;
   - Orders event timestamp;
   - source-of-truth marker.
6. Use `orders-order-created:<orderId>` as the idempotency key so redelivery does not duplicate attribution.
7. Prove with tests that forbidden order/customer/payment/address/token fields are ignored.
8. Record runtime blockers with `[MISSING: ...]` markers.

## Acceptance Criteria

- Current canonical `orders.order.created.v1` fixture is recognized but blocked for missing lead attribution.
- Future explicitly attributed synthetic event creates a minimized `LeadOrderAttributed` lifecycle event candidate.
- Duplicate deliveries for the same `orderId` produce the same idempotency key.
- Invalid event type/version/source is rejected.
- No runtime broker consumer, schema, migration, deployment, raw export, or production mutation is added.

## Validation Commands

- `npm test -- --runTestsByPath src/leads/integrations/orders-order-created-consumer-contract.spec.ts`
- `npm run build`
- `git diff --check`
