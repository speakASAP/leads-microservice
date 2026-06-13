# Goal 6 - Operational Smoke And Documentation Ingestion: Context Package

```yaml
id: LEADS-GOAL-06-CONTEXT-PACKAGE
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-06-operational-smoke-and-documentation-ingestion.execution-plan.md
downstream:
  - GOAL-06-operational-smoke-and-documentation-ingestion.coding-prompt.md
```

## Task Summary

Run operational readiness checks and refresh DocsRAG documentation retrieval evidence for Leads without changing runtime source or mutating production data.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/READINESS_GATES.md`
- `docs-rag-microservice/docs/RAG_USAGE.md`

## Relevant Files

- `package.json`
- `docs/orchestrator/STATUS.md`
- Goal 1 through Goal 6 implementation artifacts

## Current Behavior

- `STATE.json` records production health as `ok` and next focus as Goal 6.
- DocsRAG runtime credentials are available from the Leads deployment pod.
- Baseline retrieval before this ingestion returned HTTP 200 but empty context for the current Goal 6/IPS query.

## Required Behavior

- Build and full tests pass.
- Public health returns `{"status":"ok"}`.
- DocsRAG ingestion can be triggered with runtime credentials.
- Post-ingestion retrieval returns current Leads IPS/Goal docs.
- Evidence is recorded without secrets or raw lead data.

## Constraints

- No deployment.
- No production lead mutation or raw lead retrieval.
- No secrets, contact details, raw messages, confirmation tokens, private URLs, CRM records, or production payloads in evidence.
- Use the Leads runtime pod for DocsRAG credentials and do not print token values.

## Known Risks

- DocsRAG ingestion is asynchronous. Mitigation: record the job ID and verify retrieval after a short delay.
- Worktree is dirty from prior completed goals. Mitigation: record dirty status and avoid reverting unrelated changes.

## Validation Commands

Build, full tests, public health curl, DocsRAG ingestion trigger, DocsRAG retrieval, documentation presence scan, missing-marker scan, and secret-pattern scan.
