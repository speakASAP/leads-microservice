# Goal 29 Validation Report

```yaml
id: LEADS-GOAL-29-VALIDATION-REPORT
status: complete-handler-ready-live-broker-blocked
owner: orders-rollout-goal-7-4-leads-agent
created: 2026-07-01
last_updated: 2026-07-01
completeness_level: validated-handler-ready-live-broker-blocked
upstream:
  - GOAL-29-orders-event-consumer-contract.execution-plan.md
downstream:
  - ../docs/orchestrator/STATUS.md
  - ../docs/IMPLEMENTATION_STATE.md
  - ../TASKS.md
  - ../STATE.json
```

## Artifact Validated

Goal 29 - Orders Event Consumer Contract For Leads.

## Preserved Intent Evidence

Leads records only minimized attribution evidence when a canonical Orders event explicitly names the lead. Orders remains canonical order source of truth. Orders events without explicit `payload.leadAttribution.leadId` are skipped without attribution.

## Gate Evidence

Pre-coding gate result: pass-with-live-broker-blocked. DocsRAG query from the remote shell was skipped because `JWT_TOKEN` was unavailable. Repo-local Leads docs and fresh coordinator Orders evidence were used.

## Invariant Evidence

No public intake, consent, notification, marketing, AI/CRM, schema, deployment, or production data behavior changed. The implementation is limited to a local TypeScript guard, transport-independent handler, focused tests, and orchestrator/status artifacts.

## Sensitive-Data Evidence

Focused tests seed synthetic customer, address, payment, token, raw-message, and confirmation-token-like fields and assert the attribution output omits them. The output is limited to lead ID, order ID, channel, Orders event ID, Orders event timestamp, source-of-truth marker, and attribution source/campaign metadata.

## Consent Evidence

No consent, confirmation, preference, or unsubscribe behavior changes. Order attribution does not imply marketing consent, campaign approval, contact permission, or outreach permission.

## Contract Evidence

Local TypeScript contract guard, transport-independent handler, and disabled-by-default live broker adapter are present. Production enablement remains blocked by:

- `[MISSING: production LEADS_ORDERS_EVENTS_RABBITMQ_URL/Vault/K8s wiring and broker smoke approval]`
- `[MISSING: replay/backfill validation source for missed Orders events]`

## Replay/Determinism Evidence

Idempotency key is stable as `orders-order-created:<orderId>`. Focused tests prove duplicate deliveries by event ID and by order idempotency key are ignored before routing.

## Commands Run

- `git status --short --branch` before edits: `## main...origin/main`.
- `npm test -- --runTestsByPath src/leads/integrations/orders-order-created-consumer-contract.spec.ts`: passed, 1 suite, 5 tests.
- `npm run build`: passed.
- `npm test`: passed, 17 suites, 105 tests.
- `npm run lint`: passed.
- `git diff --check`: passed.
- Runtime dependency-name scan over package dependencies/devDependencies: `NO_RUNTIME_BROKER_DEPENDENCY_NAMES`.
- Broker/order-event env-name scan over `.env.example`, `k8s/configmap.yaml`, `k8s/external-secret.yaml`, and `package.json`: no RabbitMQ/AMQP/Orders event key names.

## Passed Criteria

- Current canonical `orders.order.created.v1` fixture is recognized and idempotently skipped when `payload.leadAttribution.leadId` is absent.
- Explicit `payload.leadAttribution.leadId` synthetic fixture builds a minimized `LeadOrderAttributed` lifecycle event candidate.
- Duplicate event ID and duplicate order idempotency key deliveries are ignored.
- Invalid event type, version, and source are rejected.
- Sensitive-looking synthetic fields are omitted from output.
- No enabled broker consumer, schema, migration, deployment config, raw export, or production mutation was added.

## Failed Or Skipped Criteria

Production RabbitMQ enablement skipped because secret/config wiring, broker smoke approval, and replay/backfill validation are missing.

## Decision

Pass for contract guard, transport-independent handler, disabled-by-default broker adapter, and tests; blocked for production enablement.

## Next Action

Resolve production RabbitMQ secret/config wiring and replay/backfill validation before enabling the live broker adapter.


## Goal 29C Live Broker Adapter Evidence

Implemented disabled-by-default RabbitMQ adapter for `orders.events` / `orders.order.created.v1`.

Code evidence:

- `src/leads/integrations/orders-order-created-broker-adapter.service.ts`
- `src/leads/integrations/orders-order-created-broker-adapter.service.spec.ts`
- `src/leads/leads.module.ts`
- `.env.example`
- `package.json`
- `package-lock.json`

Runtime env names verified by name only:

- `LEADS_ORDERS_EVENTS_CONSUMER_ENABLED=false`
- `LEADS_ORDERS_EVENTS_RABBITMQ_URL`
- `LEADS_ORDERS_EVENTS_EXCHANGE=orders.events`
- `LEADS_ORDERS_EVENTS_ROUTING_KEY=orders.order.created.v1`
- `LEADS_ORDERS_EVENTS_QUEUE=leads.orders.order-created.v1`
- `LEADS_ORDERS_EVENTS_PREFETCH=5`
- `LEADS_ORDERS_EVENTS_DLX=leads.orders.events.dlx`
- `LEADS_ORDERS_EVENTS_DLQ=leads.orders.order-created.v1.dlq`
- `LEADS_ORDERS_EVENTS_REQUEUE_ON_ERROR=false`

Validation commands:

- `npm test -- --runTestsByPath src/leads/integrations/orders-order-created-consumer-contract.spec.ts src/leads/integrations/orders-order-created-broker-adapter.service.spec.ts`: passed, 2 suites, 11 tests.
- `npm run build`: passed.
- `npm test`: passed, 18 suites, 111 tests.
- `npm run lint`: passed.
- `git diff --check`: passed after removing a trailing blank line in `.env.example`.
- Env-name scan over `.env.example`, K8s manifests, `package.json`, and adapter source: found only declared names/defaults; no secret values printed.

Production enablement remains blocked by:

- `[MISSING: production LEADS_ORDERS_EVENTS_RABBITMQ_URL/Vault/K8s wiring and broker smoke approval]`
- `[MISSING: replay/backfill validation source for missed Orders events]`


## Goal 29D RabbitMQ Secret Config Evidence

- Dedicated RabbitMQ user `leads_orders_events_consumer` was created/rotated without printing password values.
- AMQP connect smoke from an in-cluster Orders pod succeeded with redacted output.
- Vault property `secret/prod/leads-microservice#LEADS_ORDERS_EVENTS_RABBITMQ_URL` was patched with metadata-only output.
- `k8s/external-secret.yaml` maps `LEADS_ORDERS_EVENTS_RABBITMQ_URL` from the Leads Vault path.
- `k8s/configmap.yaml` enables the adapter and declares exchange/routing key/queue/DLX/DLQ/requeue names.
- Historical replay/backfill remains `[MISSING: replay/backfill validation source for missed Orders events]`.


## Goal 29D Validation Commands

- `kubectl apply --dry-run=server -f k8s/configmap.yaml -n statex-apps`: passed.
- `kubectl apply --dry-run=server -f k8s/external-secret.yaml -n statex-apps`: passed.
- `npm test -- --runTestsByPath src/leads/integrations/orders-order-created-consumer-contract.spec.ts src/leads/integrations/orders-order-created-broker-adapter.service.spec.ts`: passed, 2 suites, 11 tests.
- `npm run build`: passed.
- `npm test`: passed, 18 suites, 111 tests.
- `npm run lint`: passed.
- `git diff --check`: passed.
- Runtime key-name scan found only declared Leads Orders-events names/defaults; no secret values printed.
- Vault property presence check for `LEADS_ORDERS_EVENTS_RABBITMQ_URL`: present, value redacted.


Runtime DI hotfix: rollout restart surfaced that the AMQP connector test seam was modeled as a constructor parameter, so Nest tried to inject `Function`. The adapter now takes only `LeadLifecycleEventRouterService` and `LoggingService` in its constructor; tests override the internal connector property. Focused test, build, lint, diff check, and full tests passed after the fix.

## Goal 29D Runtime Deployment Evidence

- Deployed Leads image `localhost:5000/leads-microservice:9e5ac76` with digest `localhost:5000/leads-microservice@sha256:204d8a36e6b3c94097cfdde1b4ef06271ad64f807e3f14faaacf79b79831e7ca`.
- `deployment/leads-microservice` rolled out successfully; final running pod was `leads-microservice-84cb7c6fcf-7fgr5` with `1/1 Running` and zero restarts at final check.
- In-pod and public `/health` checks returned `{"status":"ok"}`.
- Runtime env-name presence check confirmed the consumer was enabled, the RabbitMQ URL was present redacted, and queue/exchange/routing-key names were set.
- RabbitMQ queue smoke confirmed `leads.orders.order-created.v1` had 0 messages and 1 consumer; `leads.orders.order-created.v1.dlq` had 0 messages and 0 consumers.
- RabbitMQ binding smoke confirmed `orders.events -> leads.orders.order-created.v1` with routing key `orders.order.created.v1`, plus DLX binding to the DLQ.
- Runtime log tail showed `Nest application successfully started` and no `ACCESS_REFUSED` or `ERROR` matches after the final permission update.
- Remaining blocker: `[MISSING: replay/backfill validation source for missed Orders events]`.
