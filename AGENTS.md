---

# Agents: leads-microservice


## Knowledge Retrieval (query before reading files)
Query the RAG service first to reuse indexed ecosystem context before reading raw files:

```bash
curl -s -X POST http://docs-rag-microservice.statex-apps.svc.cluster.local:3397/retrieval/agent-context \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR QUESTION HERE", "maxTokens": 3000}'
```

- Internal URL: `http://docs-rag-microservice.statex-apps.svc.cluster.local:3397`
- Public URL: `https://docs-rag.alfares.cz`
- Full guide: `docs-rag-microservice/docs/RAG_USAGE.md`

No autonomous AI agents. Business logic is rule-based.

## Goalkeeper Orchestrator Contract

Goalkeeper is the local implementation orchestrator for project work. It tracks goals,
sets or updates implementation goals, maintains plans, summarizes what happened during
the last run, and states the concrete next action for the owner.

Every owner-facing orchestrator reply must end with one final line:

```text
Next step: <concrete next action>
```

Use `Next step: No action needed.` only when no action remains.

## Active Agents
<!-- Coordinator-maintained -->
None.
