# Leads Microservice

## status

leads-microservice is an active production service (STATE.json: stage production) providing registration-free lead intake, CRM/AI integration, and event-driven attribution from the Orders domain.

## documentation authority

- `BUSINESS.md` for goals, constraints, and SLA
- `SYSTEM.md` for architecture, endpoints, and integrations
- `CLAUDE.md` for agent entry point and quick ops
- `docs/EXTERNAL_INTEGRATION.md` for how consumers call this service
- `docs/01_vision/VISION.md` for durable product direction

## capabilities

- Lead intake without requiring registration (`POST /leads`)
- Lead listing and update (`GET /leads`, `PATCH /leads/:id`)
- GDPR consent tracking per lead
- CRM and AI-analysis integration for submitted leads
- Event-driven lead attribution from the Orders domain via a RabbitMQ order-created consumer
- Marketing campaign eligibility preview and lifecycle routing (per TASKS.md goal history)

## interfaces

- `POST /leads`, `GET /leads`, `PATCH /leads/:id`, `GET /health`
- Max 30 items per request (documented rate/size limit)
- Domain: https://leads.alfares.cz
- Ports: 4400 (blue) / 4401 (green)

## development

- Stack: NestJS, PostgreSQL, Prisma
- Local run per repository package.json scripts; Prisma migrations under `prisma/`
- First deploy requires creating the `leads` database on database-server before `prisma migrate deploy` runs on container start

## configuration

- Runtime namespace: `statex-apps`
- Secrets: Vault `secret/prod/leads-microservice` -> ExternalSecret (`k8s/external-secret.yaml`) -> K8s Secrets; never hardcode secrets
- Env vars: `DB_HOST`/`DB_*`, `LOGGING_SERVICE_URL`, `AUTH_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`, `AI_SERVICE_URL`, optional `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`/`REDIS_DB`, `LEADS_ORDERS_EVENTS_RABBITMQ_URL`

## deployment

- Deploy command: `./scripts/deploy.sh`
- Image: `localhost:5000/leads-microservice:latest`
- Target: Kubernetes (k3s) `statex-apps` namespace
- Logs: `kubectl logs -n statex-apps -l app=leads-microservice -f`

## health and observability

- Health endpoint: `GET /health`
- Structured logging via `logging-microservice` (`LOGGING_SERVICE_URL`)
