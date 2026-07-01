# Goal 29 - Orders Event Consumer Contract For Leads

## Status

contract guard, transport-independent runtime handler, and opt-in live broker adapter implemented; production enablement blocked

## Vision

Leads can use canonical Orders lifecycle events as read-only CRM/follow-up signals, but it must not duplicate Orders state, infer lead attribution from unsafe fields, or become the order source of truth.

## Goal Impact

This goal anchors the Orders production rollout Goal 7.4 Leads lane in the Leads repo. It verifies the actual Orders event contract, records the runtime blockers, and adds Leads-side tests for the safe minimum attribution behavior.

## System

- Orders source of truth: `orders-microservice` publishes `orders.order.created.v1` on RabbitMQ exchange `orders.events`.
- Current Orders payload: `payload.orderId` and `payload.channel`.
- Leads source of truth: existing minimized lifecycle event storage can record local evidence by `leadId`, `eventId`, and `idempotencyKey`.
- Live broker surface: Leads has an opt-in RabbitMQ adapter and explicit env-name convention; production enablement remains disabled until Vault/K8s values and replay/backfill validation are approved.

## Feature

Leads-side order-created attribution contract:

- accepts only the canonical `orders.order.created.v1` envelope;
- idempotently skips Orders events when `payload.leadAttribution.leadId` is absent;
- accepts only the explicit minimal key `payload.leadAttribution.leadId`;
- builds and routes a minimized `LeadOrderAttributed` lifecycle event only when attribution is explicit;
- uses `orders-order-created:<orderId>` as the idempotency key;
- omits all customer, address, payment, tracking, token, raw contact, raw message, metadata, and secret values.

## Task

- [x] 29.1 Verify Orders event source and Leads broker/runtime support.
- [x] 29.2 Create execution plan, context package, coding prompt, and validation report.
- [x] 29.3 Add focused contract guard and tests for `orders.order.created.v1`.
- [x] 29.4 Record runtime blockers and validation evidence.
- [x] 29.5 Implement transport-independent runtime handler for created events.
- [x] 29.6 Define Leads-owned RabbitMQ env names and add disabled-by-default live broker adapter.
- [ ] 29.7 Wire production RabbitMQ secret/config values and replay/backfill validation before deployment enablement.

## Execution Plan

See `GOAL-29-orders-event-consumer-contract.execution-plan.md`.

## Coding Prompt

See `GOAL-29-orders-event-consumer-contract.coding-prompt.md`.

## Code

- `src/leads/integrations/orders-order-created-consumer-contract.ts`
- `src/leads/integrations/orders-order-created-consumer-contract.spec.ts`

## Runtime Blockers

- `[MISSING: production LEADS_ORDERS_EVENTS_RABBITMQ_URL/Vault/K8s wiring and broker smoke approval]`
- `[MISSING: replay/backfill validation source for missed Orders events]`

## Contract Plan

1. Orders owner decides one approved attribution contract:
   - add `payload.leadAttribution.leadId` to `orders.order.created.v1`; or
   - emit a separate minimized order-to-lead attribution event; or
   - expose a guarded Orders/Leads lookup API that returns only the approved `leadId` for an order.
2. Leads runtime owner has added an optional RabbitMQ adapter with:
   - exchange env/default: `LEADS_ORDERS_EVENTS_EXCHANGE=orders.events`;
   - routing-key env/default: `LEADS_ORDERS_EVENTS_ROUTING_KEY=orders.order.created.v1`;
   - queue env/default: `LEADS_ORDERS_EVENTS_QUEUE=leads.orders.order-created.v1`;
   - URL env: `LEADS_ORDERS_EVENTS_RABBITMQ_URL`;
   - opt-in env: `LEADS_ORDERS_EVENTS_CONSUMER_ENABLED=false` by default;
   - DLX/DLQ env defaults: `LEADS_ORDERS_EVENTS_DLX=leads.orders.events.dlx`, `LEADS_ORDERS_EVENTS_DLQ=leads.orders.order-created.v1.dlq`;
   - prefetch env/default: `LEADS_ORDERS_EVENTS_PREFETCH=5`;
   - error requeue env/default: `LEADS_ORDERS_EVENTS_REQUEUE_ON_ERROR=false`;
   - idempotency key: `orders-order-created:<orderId>`;
   - persisted minimized event type: `LeadOrderAttributed`.
3. Validation owner proves:
   - contract fixture compatibility;
   - redelivery idempotency;
   - sensitive-field omission;
   - no lead attribution without explicit key;
   - no raw order/customer/payment/address/contact export;
   - broker smoke without printing secrets.

## Validation

See `GOAL-29-orders-event-consumer-contract.validation-report.md`.
