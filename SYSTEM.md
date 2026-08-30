# System: Leads Microservice

```yaml
id: SYSTEM-leads-microservice
status: approved
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - BUSINESS.md
  - docs/01_vision/VISION.md
downstream:
  - docs/06_architecture/INTEGRATION_CONTRACT.md
  - docs/11_tasks/TASK-001-bootstrap-service.md
```

## purpose

leads-microservice is the ecosystem's registration-free lead intake and attribution service, integrating with CRM, AI analysis, and downstream Orders-domain events while enforcing GDPR consent.

## responsibilities

- Accept and store lead submissions with GDPR consent tracking
- Expose lead read/update endpoints for CRM and downstream consumers
- Integrate with ai-microservice for lead analysis
- Consume Orders `order.created` events via RabbitMQ for lead attribution
- Support marketing campaign eligibility preview and lifecycle routing

## non-responsibilities

- It does not process orders, payments, or catalog data itself
- It does not perform mass outreach or export raw lead data without explicit human approval
- It does not require user registration for lead capture

## inputs

- Lead submissions via `POST /leads`
- Orders-domain `order.created` events via the RabbitMQ consumer (`LEADS_ORDERS_EVENTS_RABBITMQ_URL`)
- Lead updates via `PATCH /leads/:id`

## outputs

- Stored, GDPR-consent-tracked lead records
- CRM/AI-analysis integration calls
- Attributed lead-to-order linkage events

## dependencies

- PostgreSQL (`leads` database) via `DB_HOST`/`DB_*` and Prisma
- logging-microservice via `LOGGING_SERVICE_URL`
- auth-microservice via `AUTH_SERVICE_URL`
- notifications-microservice via `NOTIFICATION_SERVICE_URL`
- ai-microservice via `AI_SERVICE_URL`
- RabbitMQ via `LEADS_ORDERS_EVENTS_RABBITMQ_URL` for the Orders order-created event consumer
- Optional Redis via `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/`REDIS_DB` (declared in .env.example but no code reference found)

## upstream traceability

This system implements the approved intent in `BUSINESS.md` and the product vision in `docs/01_vision/VISION.md`.

## downstream artifacts

- `docs/06_architecture/INTEGRATION_CONTRACT.md`
- `docs/11_tasks/TASK-001-bootstrap-service.md`
- `docs/12_validation/VAL-TASK-001-bootstrap-service.md`
- `docs/21_execution_plans/EP-TASK-001-bootstrap-service.md`

## validation criteria

- `GET /health` passes
- Max 30 items per request enforced; do not increase timeouts without checking logs first
- Contract guard tests for the Orders order-created consumer (per TASKS.md goal-29 series)

## open questions

- Replay/backfill validation source for missed Orders order-created events is not yet defined; the live consumer is enabled only for new explicit lead-attribution events (STATE.json next_focus).
