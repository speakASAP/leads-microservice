# Goal 29 - Orders Event Consumer Contract For Leads

## Status

contract guard and transport-independent runtime handler implemented; live broker adapter blocked

## Vision

Leads can use canonical Orders lifecycle events as read-only CRM/follow-up signals, but it must not duplicate Orders state, infer lead attribution from unsafe fields, or become the order source of truth.

## Goal Impact

This goal anchors the Orders production rollout Goal 7.4 Leads lane in the Leads repo. It verifies the actual Orders event contract, records the runtime blockers, and adds Leads-side tests for the safe minimum attribution behavior.

## System

- Orders source of truth: `orders-microservice` publishes `orders.order.created.v1` on RabbitMQ exchange `orders.events`.
- Current Orders payload: `payload.orderId` and `payload.channel`.
- Leads source of truth: existing minimized lifecycle event storage can record local evidence by `leadId`, `eventId`, and `idempotencyKey`.
- Missing live broker surface: Leads has no RabbitMQ consumer module, dependency, queue config, retry/DLQ policy, or approved live adapter env-name convention.

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
- [ ] 29.6 Implement live RabbitMQ adapter after runtime config and replay contracts are resolved.

## Execution Plan

See `GOAL-29-orders-event-consumer-contract.execution-plan.md`.

## Coding Prompt

See `GOAL-29-orders-event-consumer-contract.coding-prompt.md`.

## Code

- `src/leads/integrations/orders-order-created-consumer-contract.ts`
- `src/leads/integrations/orders-order-created-consumer-contract.spec.ts`

## Runtime Blockers

- `[MISSING: Leads RabbitMQ consumer runtime convention for orders.events queue name, env vars, retry/backoff, and DLQ handling]`
- `[MISSING: replay/backfill validation source for missed Orders events]`

## Contract Plan

1. Orders owner decides one approved attribution contract:
   - add `payload.leadAttribution.leadId` to `orders.order.created.v1`; or
   - emit a separate minimized order-to-lead attribution event; or
   - expose a guarded Orders/Leads lookup API that returns only the approved `leadId` for an order.
2. Leads runtime owner adds an optional RabbitMQ adapter with:
   - exchange: `orders.events`;
   - routing key: `orders.order.created.v1`;
   - queue: `[MISSING: approved queue name]`;
   - env vars: `[MISSING: approved RABBITMQ_URL/queue/retry/DLQ names for Leads]`;
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
