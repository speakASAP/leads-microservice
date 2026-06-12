# GOAL-01: Intent Preservation System

```yaml
id: LEADS-GOAL-01
status: done
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - ../BUSINESS.md
  - ../SYSTEM.md
  - ../TASKS.md
  - ../STATE.json
downstream:
  - ../docs/orchestrator/
  - ../docs/IMPLEMENTATION_ORCHESTRATOR.md
  - ../docs/IMPLEMENTATION_STATE.md
```

## Intent

Leads must have a durable local workflow for future development that preserves lead-intake, consent, privacy, and ecosystem ownership boundaries.

## Scope

- Add service-local orchestrator and IPS docs.
- Add implementation-goal templates.
- Update `AGENTS.md` with required workflow.
- Record documentation-only validation.

## Non-Goals

- No runtime code changes.
- No schema changes.
- No deployment.
- No raw lead data review or export.
- No DocsRAG ingestion without credentials.

## Acceptance Criteria

- Required orchestrator docs exist.
- Future coding is blocked until traceability, invariant, sensitive-data, consent, contract, validation, and readiness checks are complete.
- Leads ownership and non-ownership boundaries are explicit.
- Documentation-only scans pass.

## Evidence

Evidence is recorded in `docs/orchestrator/STATUS.md` under `2026-06-12 - Intent Preservation System`.
