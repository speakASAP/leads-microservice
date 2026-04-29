# CLAUDE.md (leads-microservice)

Ecosystem defaults: [`../CLAUDE.md`](../CLAUDE.md) · [`../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md`](../shared/docs/PROJECT_AGENT_DOCS_STANDARD.md)

Read in order: `BUSINESS.md` → `SYSTEM.md` → `AGENTS.md` → `TASKS.md` → `STATE.json`

---

## leads-microservice

**Purpose**: Lead intake without registration. Contact form submissions → CRM + AI analysis.
**Domain**: https://leads.alfares.cz · **Ports**: 4400 (blue) · 4401 (green)
**Stack**: NestJS · PostgreSQL · Prisma · Kubernetes (`statex-apps`)
**Secrets**: Vault `secret/prod/leads-microservice` → K8s ExternalSecret

### Constraints
- GDPR: always store consent with lead
- No raw lead data export without owner approval
- No mass outreach without human review
- All notifications via notifications-microservice

### Consumers
statex · marketing-microservice

### Quick ops
```bash
curl https://leads.alfares.cz/health   # health check
./scripts/deploy.sh                    # deploy
docker compose logs -f                 # legacy logs
kubectl logs -n statex-apps -l app=leads-microservice -f  # k8s logs
```
