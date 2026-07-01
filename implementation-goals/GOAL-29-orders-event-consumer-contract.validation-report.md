# Goal 29 Validation Report

```yaml
id: LEADS-GOAL-29-VALIDATION-REPORT
status: complete-runtime-blocked
owner: orders-rollout-goal-7-4-leads-agent
created: 2026-07-01
last_updated: 2026-07-01
completeness_level: validated-runtime-blocked
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

Leads records only minimized attribution evidence when a canonical Orders event explicitly names the lead. Orders remains canonical order source of truth. The current Orders event is not consumed for attribution because it lacks a safe lead key.

## Gate Evidence

Pre-coding gate result: pass-with-blocked-runtime. DocsRAG query from the Leads runtime pod returned HTTP 200 with empty context and no sources for the Orders consumer query. Repo-local Leads docs and remote Orders source-of-truth docs/source were used.

## Invariant Evidence

No public intake, consent, notification, marketing, AI/CRM, schema, deployment, or production data behavior changed. The implementation is limited to a local TypeScript guard, focused tests, and orchestrator/status artifacts.

## Sensitive-Data Evidence

Focused tests seed synthetic customer, address, payment, token, raw-message, and confirmation-token-like fields and assert the attribution output omits them. The output is limited to lead ID, order ID, channel, Orders event ID, Orders event timestamp, source-of-truth marker, and attribution metadata.

## Consent Evidence

No consent, confirmation, preference, or unsubscribe behavior changes. Order attribution does not imply marketing consent, campaign approval, contact permission, or outreach permission.

## Contract Evidence

Local TypeScript contract guard only. Runtime consumer remains blocked by:

- `[MISSING: Orders order-created event lead attribution field]`
- `[MISSING: Leads RabbitMQ consumer runtime convention for orders.events queue name, env vars, retry/backoff, and DLQ handling]`
- `[MISSING: replay/backfill validation source for missed Orders events]`

## Replay/Determinism Evidence

Idempotency key is stable as `orders-order-created:<orderId>`. Focused tests prove two deliveries of the same order with different event IDs produce the same idempotency key.

## Commands Run

- `npm test -- --runTestsByPath src/leads/integrations/orders-order-created-consumer-contract.spec.ts`: passed, 1 suite, 4 tests.
- `npm run build`: passed.
- `git diff --check`: passed.
- Broker dependency-name check in `package.json`: `NO_BROKER_DEPENDENCY_NAMES`.
- Broker/order-event env-name scan over `.env.example`, `k8s/configmap.yaml`, `k8s/external-secret.yaml`, and `package.json`: no matches.

## Passed Criteria

- Current canonical `orders.order.created.v1` fixture is recognized but blocked for missing lead attribution.
- Future explicit `payload.leadAttribution.leadId` synthetic fixture builds a minimized `LeadOrderAttributed` lifecycle event candidate.
- Duplicate delivery idempotency key is stable as `orders-order-created:<orderId>`.
- Invalid event type, version, and source are rejected.
- Sensitive-looking synthetic fields are omitted from output.
- No runtime broker consumer, schema, migration, deployment, raw export, or production mutation was added.

## Failed Or Skipped Criteria

Runtime consumer implementation skipped because attribution and broker runtime contracts are missing.

## Decision

Pass for contract guard/tests; blocked for runtime consumer.

## Next Action

Resolve the Orders attribution and Leads RabbitMQ runtime blockers before implementing a live consumer.
