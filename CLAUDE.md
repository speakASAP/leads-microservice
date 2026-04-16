# CLAUDE.md (leads-microservice)

Ecosystem defaults: sibling [`../CLAUDE.md`](../CLAUDE.md) and [`../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md`](../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md).

Read this repo's `BUSINESS.md` → `SYSTEM.md` → `AGENTS.md` → `TASKS.md` → `STATE.json` first.

---

## leads-microservice

**Purpose**: Lead intake and follow-up without requiring registration. Collects contact form submissions; integrates with CRM and AI analysis.  
**Ports**: 4400 (blue) · 4401 (green)  
**Domain**: https://leads.alfares.cz  
**Stack**: NestJS · PostgreSQL

### Key constraints
- GDPR: lead data requires explicit consent tracking — always store consent with the lead
- Never export raw lead data without explicit owner approval
- No mass outreach without human review
- All lead notifications via notifications-microservice

### Consumers
sgiprealestate, statex, marketing-microservice.

### Quick ops
```bash
curl https://leads.alfares.cz/health
docker compose logs -f
./scripts/deploy.sh
```
