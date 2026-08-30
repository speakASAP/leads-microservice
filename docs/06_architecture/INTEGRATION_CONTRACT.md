# Integration Contract: Leads Microservice

```yaml
id: INTEGRATION-CONTRACT-leads-microservice
status: approved
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - SYSTEM.md
  - BUSINESS.md
downstream:
  - docs/11_tasks/TASK-001-bootstrap-service.md
  - docs/12_validation/VAL-TASK-001-bootstrap-service.md
```

## purpose

This contract records the ecosystem dependencies required for leads-microservice to operate as the registration-free lead intake and Orders-attribution service, and the fallback behavior when a dependency degrades.

## capability decisions

| Capability | Component | Decision | Reason |
|---|---|---|---|
| auth | auth-microservice | required | SYSTEM.md documents AUTH_SERVICE_URL as an integration used by this service, and TASKS.md records a completed 'production auth workspace token matrix validation' goal. |
| postgres | database-server (db-server-postgres) | required | SYSTEM.md documents the `leads` PostgreSQL database via DB_HOST/DB_* and Prisma, with first-deploy database creation and `prisma migrate deploy` on container start. |
| redis | database-server (db-server-redis) | not-applicable | .env.example declares optional REDIS_HOST/REDIS_PORT/REDIS_PASSWORD/REDIS_DB variables, but no code reference to Redis was found anywhere in src/; the service does not currently use Redis. |
| logging | logging-microservice | required | SYSTEM.md documents LOGGING_SERVICE_URL for centralized logging. |
| notifications | notifications-microservice | required | SYSTEM.md documents NOTIFICATION_SERVICE_URL as an integration for this service. |
| ai | ai-microservice | required | SYSTEM.md documents AI_SERVICE_URL for AI-based lead analysis integration, and BUSINESS.md's core constraint governs how AI may use lead data. |
| payments | payments-microservice | not-applicable | leads-microservice does not process payments; it only attributes leads to Orders-domain events. |
| catalog | catalog-microservice | not-applicable | No catalog/product-domain integration exists in this repository. |
| orders | orders-microservice | required | TASKS.md documents a completed Orders order-created event consumer (goal-29 series) with a live RabbitMQ broker adapter, attributing leads to Orders events. |
| warehouse | warehouse-microservice | not-applicable | No physical inventory or warehouse concern exists in this lead-intake service. |
| invoices | invoices-microservice | not-applicable | No invoicing integration exists in this repository. |
| object-storage | minio-microservice | not-applicable | No object-storage usage was found in this repository's code or configuration. |
| event-bus | RabbitMQ | required | src/leads/integrations/orders-order-created-broker-adapter.service.ts implements a live RabbitMQ consumer for Orders order-created events, configured via LEADS_ORDERS_EVENTS_RABBITMQ_URL. |
| docs-rag | docs-rag-microservice | required | AGENTS.md already directs agents to use docs-rag-microservice for bounded discovery on this repository, with Git as the authoritative fallback. |
| monitoring | monitoring-microservice | required | Runtime health and rollout readiness must be observable through the shared monitoring model, consistent with the documented GET /health endpoint. |
| backups | backups-microservice | required | The `leads` PostgreSQL database holds production lead and consent data and requires backup coverage consistent with other ecosystem databases. |

## data ownership

leads-microservice owns lead, consent, and attribution data in its PostgreSQL database. Orders-microservice owns order data; leads-microservice only consumes order-created events for attribution, it does not own order state.

## authentication and authorization

- Auth-backed admin/API authentication is required for protected admin routes per goal-19.
- Public lead-submission endpoints (POST /leads) do not require end-user registration by design.

## synchronous dependencies

- PostgreSQL reads/writes for lead/consent/attribution data
- AI-analysis calls to ai-microservice
- Auth validation calls to auth-microservice for admin routes

## asynchronous dependencies

- RabbitMQ consumption of Orders order-created events for lead attribution
- Notification dispatch to notifications-microservice
- Structured log delivery to logging-microservice

## degraded operation

When RabbitMQ or the Orders event consumer is unavailable, new lead-attribution events are missed rather than silently fabricated; this is tracked as an open blocker until replay/backfill validation is defined. AI or notification outages degrade enrichment/awareness without blocking core lead capture.

## validation

- GET /health passes
- Orders order-created consumer contract guard tests pass
- Max 30 items per request enforced under load
