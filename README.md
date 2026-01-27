# Leads Microservice

Leads intake and follow-up service for collecting contact submissions without
forcing account registration. Designed for production-only deployments and
integrated with all shared Statex microservices.

## Responsibilities

- Accept lead submissions with multiple contact methods
- Store lead data and submission history
- Send confirmation messages via notifications microservice
- Provide status updates and offer links later in the flow
- Log all lead lifecycle events to centralized logging

## Shared Microservices (Required)

This service must integrate with all shared services:

- Auth microservice (`AUTH_SERVICE_URL`)
- Database server (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- Logging microservice (`LOGGING_SERVICE_URL`)
- Notifications microservice (`NOTIFICATION_SERVICE_URL`)
- Payments microservice (`PAYMENT_SERVICE_URL`)
- AI microservice (`AI_SERVICE_URL`)
- Nginx microservice (blue/green deployment and routing)

## API Overview

Planned public endpoints (final contract in docs):

- `POST /api/leads/submit` - Create lead and submission
- `GET /health` - Health check

## Configuration

All configuration is provided via `.env`. Do not hardcode values.
See `.env.example` for all required keys.

## Deployment (Blue/Green)

Use:

```bash
./scripts/deploy.sh
```

This calls `nginx-microservice/scripts/blue-green/deploy-smart.sh` and registers
API routes via `nginx-api-routes.conf`.

## Nginx API Routes

Custom API routes are registered through `nginx-api-routes.conf` and picked up
automatically by nginx-microservice during deployment.

## Logging

All operational and audit logs must be sent to the centralized logging
microservice (`LOGGING_SERVICE_URL`).

## Constraints

- Production-only workflow (no dev/prod separation)
- No automated tests
- Max 30 items per request
- Do not increase timeouts; check logs when delays happen
