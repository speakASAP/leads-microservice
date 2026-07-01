# Goal 29 Context Package

```yaml
id: LEADS-GOAL-29-CONTEXT-PACKAGE
status: active
owner: orders-rollout-goal-7-4-leads-agent
created: 2026-07-01
last_updated: 2026-07-01
completeness_level: handler-ready-live-broker-blocked
upstream:
  - GOAL-29-orders-event-consumer-contract.execution-plan.md
downstream:
  - GOAL-29-orders-event-consumer-contract.coding-prompt.md
```

## Task Summary

Orders production rollout Goal 7.4 asks Leads to consume canonical Orders lifecycle events as read-only signals. The first milestone is `orders.order.created.v1`. The current safe Leads-side scope is a contract guard plus transport-independent handler because Leads has no RabbitMQ consumer infrastructure; processing remains gated on explicit `payload.leadAttribution.leadId`.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/STATUS.md`
- `implementation-goals/GOAL-29-orders-event-consumer-contract.md`
- Orders source-of-truth docs/source:
  - `/home/ssf/Documents/Github/orders-microservice/docs/orchestrator/ORDER_EVENT_CONTRACTS.md`
  - `/home/ssf/Documents/Github/orders-microservice/src/orders/order-event-contracts.ts`
  - `/home/ssf/Documents/Github/orders-microservice/src/orders/order-events.service.ts`
  - `/home/ssf/Documents/Github/orders-microservice/docs/orchestrator/event-fixtures/orders.order.created.v1.json`
  - `/home/ssf/Documents/Github/orders-microservice/docs/orchestrator/PRODUCTION_ORDER_INTEGRATION_PLAN.md`

## Relevant Files

Leads:

- `package.json`
- `src/leads/integrations/lifecycle-events.ts`
- `src/leads/integrations/lifecycle-event-router.service.ts`
- `src/leads/leads.service.ts`
- `prisma/schema.prisma`
- `k8s/configmap.yaml`
- `k8s/external-secret.yaml`

Orders:

- `docs/orchestrator/ORDER_EVENT_CONTRACTS.md`
- `src/orders/order-event-contracts.ts`
- `src/orders/order-events.service.ts`
- `docs/orchestrator/event-fixtures/orders.order.created.v1.json`

## Current Behavior

- Orders publishes `orders.order.created.v1` on RabbitMQ exchange `orders.events`.
- The current created-event payload contains only `orderId` and `channel`.
- Leads package dependencies include Nest, Prisma, Axios, and validation libraries; no RabbitMQ/amqplib dependency is present.
- Leads Kubernetes config and secret mapping do not define broker URL, queue name, routing key, retry, or DLQ settings.
- Leads has durable minimized lifecycle event storage that can hold local lifecycle evidence by `leadId`, `eventId`, and `idempotencyKey`.

## Required Behavior

- Leads must not treat Orders events as order source-of-truth storage.
- Leads may only record a minimized order-attribution lifecycle event when a trusted event explicitly identifies the lead.
- The current Orders event must be blocked for attribution because it lacks `leadId`, `sourceLeadId`, a contact hash, or another approved linking key.
- Live broker adapter work must define queue binding, retry/DLQ, idempotent ack behavior, and runtime env names before deployment.

## Constraints

- Preserve Leads as the consent-aware non-registered lead intake and preference service.
- Preserve Orders as canonical order lifecycle source of truth.
- Do not infer attribution from raw customer/contact/payment/address fields.
- Do not add campaign execution, notification dispatch, AI enrichment, CRM workflow ownership, raw lead export, or production mutation.
- Do not print or persist secret values.

## Known Risks

- `[MISSING: production LEADS_ORDERS_EVENTS_RABBITMQ_URL/Vault/K8s wiring and broker smoke approval]`
- `[MISSING: runtime queue name, routing key binding, retry/backoff, and dead-letter policy]`
- `[MISSING: replay/backfill source and validation smoke for missed Orders events]`

## Validation Commands

- `npm test -- --runTestsByPath src/leads/integrations/orders-order-created-consumer-contract.spec.ts`
- `npm run build`
- `git diff --check`
- `git status --short --branch`
