# Claude Instructions

Shared rules live here:

- Claude profile: `/home/ssf/.claude/CLAUDE.md`
- Shared ecosystem instructions: `/home/ssf/Documents/Github/CLAUDE.md`
- Codex profile: `/home/ssf/.codex/AGENTS.md`
- Cross-agent standard: `/home/ssf/.ai-agent-standards/CROSS_AGENT_AUTOMATION_STANDARD.md`
- Repository operations: `AGENT_OPERATIONS.md`

Read those first, then follow the repository-specific notes below and the current planning/status files.


## Repository-Specific Notes

# CLAUDE.md (leads-microservice)

→ Ecosystem: [../shared/CLAUDE.md](../shared/CLAUDE.md) | Reading order: `BUSINESS.md` → `SYSTEM.md` → `AGENTS.md` → `TASKS.md` → `STATE.json`

---

## Knowledge Retrieval — docs-rag-microservice (MANDATORY, query before reading files)

**Query the RAG before reading source files** — saves 2000-5000 tokens per answer.

```bash
kubectl -n statex-apps exec deployment/leads-microservice -- curl -s -X POST http://docs-rag-microservice:3397/retrieval/agent-context \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat ~/.claude/rag-token)" \
  -d '{"query": "YOUR QUESTION HERE", "maxTokens": 3000}'
```

---

## leads-microservice

**Purpose**: Lead intake without registration. Contact form submissions → CRM + AI analysis.
**Domain**: https://leads.alfares.cz · **Port**: 4400
**Stack**: NestJS · PostgreSQL · Prisma · Kubernetes (`statex-apps`)
**Secrets**: Vault `secret/prod/leads-microservice` → K8s ExternalSecret

### Constraints
- GDPR: always store consent with lead
- No raw lead data export without owner approval
- No mass outreach without human review
- All notifications via notifications-microservice

### Consumers
statex · marketing-microservice

**Ops**: `curl https://leads.alfares.cz/health` · `kubectl logs -n statex-apps -l app=leads-microservice -f` · `./scripts/deploy.sh`
