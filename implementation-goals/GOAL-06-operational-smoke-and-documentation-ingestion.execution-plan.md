# Goal 6 - Operational Smoke And Documentation Ingestion: Execution Plan

```yaml
id: LEADS-GOAL-06-EXECUTION-PLAN
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-06-operational-smoke-and-documentation-ingestion.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-06-operational-smoke-and-documentation-ingestion.context-package.md
  - GOAL-06-operational-smoke-and-documentation-ingestion.coding-prompt.md
  - GOAL-06-operational-smoke-and-documentation-ingestion.validation-report.md
```

## Selected Goal

Goal 6 - Operational Smoke And Documentation Ingestion, chunks 6.1 through 6.4.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake service. This goal validates build/test/health and documentation retrieval without changing runtime behavior, exporting raw lead data, or mutating production.

## Goal Impact

The goal records production readiness evidence and confirms DocsRAG can retrieve current Leads IPS documentation after ingestion.

## Invariant Impact

- `LEADS-INV-001`: preserved; no lead ownership change.
- `LEADS-INV-002`: preserved; no cross-service ownership change.
- `LEADS-INV-003`: preserved; no consent semantics changed.
- `LEADS-INV-004`: preserved; no raw lead data was read, exported, or recorded.
- `LEADS-INV-005`: preserved; no outreach automation.
- `LEADS-INV-006`: preserved; no public intake/list limit changes.
- `LEADS-INV-007`: preserved; no internal-service trust behavior changed.
- `LEADS-INV-008`: preserved; no notification behavior changed.
- `LEADS-INV-009`: preserved; no AI/CRM export.
- `LEADS-INV-010`: satisfied through status and continuation updates.

## Sensitive-Data Classification

`none`: commands use build/test, public health, and DocsRAG documentation retrieval. No production lead rows, real contact details, raw messages, confirmation tokens, private URLs, CRM records, secrets, or raw payloads are captured.

## Consent Impact

No consent, confirmation, preference, or unsubscribe behavior changed.

## Contract/Schema Impact

No API, schema, logging, notification, AI, CRM, or database contract changed. This goal validates existing code and documentation ingestion only.

## Replay/Determinism Impact

Repeated validation is safe: build/test are local repo checks, health is read-only, DocsRAG ingestion refreshes documentation indexes, and retrieval is read-only. No duplicate lead, notification, confirmation, unsubscribe, AI, or CRM side effect is created.

## Scope

- Run `npm run build`.
- Run `npm test`.
- Verify public production health.
- Trigger DocsRAG ingestion for `leads-microservice` using runtime credentials.
- Verify DocsRAG retrieval returns current Leads IPS/Goal docs.
- Update Goal 6 artifacts, status, and continuation state.

## Non-Goals

- Runtime source changes.
- Production lead mutation or raw retrieval.
- Deployment.
- Secrets inspection.
- Raw lead export.
- Outreach automation.

## Files To Inspect

- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/orchestrator/READINESS_GATES.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs-rag-microservice/docs/RAG_USAGE.md`
- `package.json`

## Files To Modify

- `implementation-goals/GOAL-06-operational-smoke-and-documentation-ingestion.md`
- `implementation-goals/GOAL-06-operational-smoke-and-documentation-ingestion.execution-plan.md`
- `implementation-goals/GOAL-06-operational-smoke-and-documentation-ingestion.context-package.md`
- `implementation-goals/GOAL-06-operational-smoke-and-documentation-ingestion.coding-prompt.md`
- `implementation-goals/GOAL-06-operational-smoke-and-documentation-ingestion.validation-report.md`
- `implementation-goals/README.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`

## Validation Plan

Run and record build, tests, health, DocsRAG ingestion, DocsRAG retrieval, documentation presence scan, missing-marker scan, and secret-pattern scan.

## Pre-Coding Gate

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 6 - Operational Smoke And Documentation Ingestion
Chunk: 6.1, 6.2, 6.3, 6.4
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: dirty from prior Goal 4 and Goal 5 changes; Goal 6 does not revert unrelated changes.
DocsRAG query: HTTP 200 before ingestion, with empty context for the current Goal 6/IPS query; ingestion and post-ingestion retrieval were planned.
Execution plan: this file.
Context package: `GOAL-06-operational-smoke-and-documentation-ingestion.context-package.md`.
Coding prompt: `GOAL-06-operational-smoke-and-documentation-ingestion.coding-prompt.md`.
Invariants checked: `LEADS-INV-001` through `LEADS-INV-010`.
Sensitive-data classification: `none`.
Consent impact: no semantics change.
Contract/schema impact: no runtime contract or schema change.
AI/CRM export impact: no AI/CRM export.
Outreach impact: no outreach automation.
Validation commands: build, tests, health, DocsRAG ingestion/retrieval, docs scans.
Result: pass.

## Rollback Plan

Revert only the Goal 6 documentation/state updates with a targeted patch while preserving prior Goal 4 and Goal 5 changes. If evidence needs correction, append a new status entry rather than deleting history.
