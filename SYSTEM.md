# System: leads-microservice

## Architecture

NestJS + PostgreSQL + Prisma. Blue/green 4400/4401.

- Endpoints: POST /leads, GET /leads, PATCH /leads/:id
- GDPR consent tracked per lead

## Integrations

| Service | Usage |
|---------|-------|
| database-server:5432 | PostgreSQL |
| logging-microservice:3367 | Logs |

## Current State
<!-- AI-maintained -->
Stage: production

## Known Issues
<!-- AI-maintained -->
- None
