# Agents: leads-microservice

## Remote-First Working Rule

All implementation and orchestration work for this project must happen on the remote `alfares` server in:

```bash
/home/ssf/Documents/Github/leads-microservice
```

Use local files only as a temporary staging mirror when needed, then copy changes to the remote repo and validate on `alfares`.

## Knowledge Retrieval (query before reading files)

Query the RAG service first to reuse indexed ecosystem context before broad architecture or cross-service file review:

```bash
curl -s -X POST http://docs-rag-microservice.statex-apps.svc.cluster.local:3397/retrieval/agent-context \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR QUESTION HERE", "maxTokens": 3000}'
```

- Internal URL: `http://docs-rag-microservice.statex-apps.svc.cluster.local:3397`
- Public URL: `https://docs-rag.alfares.cz`
- Full guide: `docs-rag-microservice/docs/RAG_USAGE.md`
- If a token is unavailable, record that limitation in `docs/orchestrator/STATUS.md` and use repo-local source-of-truth docs only.

No autonomous AI agents. Business logic is rule-based.

## Intent Preservation

Use the Leads Intent Preservation System for all future work:

- Start from `docs/IMPLEMENTATION_STATE.md`.
- Read `docs/IMPLEMENTATION_ORCHESTRATOR.md`.
- Read `docs/orchestrator/MASTER_PROMPT.md`, `INTENT.md`, `GOALS.md`, `PLAN.md`, `PROJECT_INVARIANTS.md`, `PRE_CODING_GATE.md`, `CONTEXT_PACKAGE.md`, `EXECUTION_PLAN.md`, `READINESS_GATES.md`, `PROMPTS.md`, and `STATUS.md`.
- Select the active goal or earliest pending goal unless the owner explicitly selects another task.
- Before source edits, create or update the goal-specific execution plan, context package, coding prompt, and validation report under `implementation-goals/`.
- Run the pre-coding gate and block on unresolved execution-critical gaps.
- After work, record validation evidence in `docs/orchestrator/STATUS.md` and update continuation state.

Preserved intent: Leads is the consent-aware non-registered lead intake service. It owns lead records, contact methods, submissions, confirmation, preferences, and unsubscribe state. It must not export raw lead data, trigger mass outreach without human review, or take over Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.

## Required Gates

Future coding requires:

- upstream traceability;
- invariant impact review;
- sensitive-data classification;
- consent impact review;
- contract/schema impact review;
- replay/determinism review;
- explicit validation commands;
- readiness evidence.

Do not code when raw lead data export, mass outreach, consent semantics, trusted internal-service access, or production mutation validation is unclear.

## Active Agents
<!-- Coordinator-maintained -->
None.
