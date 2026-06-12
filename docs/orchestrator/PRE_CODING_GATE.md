# Leads Pre-Coding Gate

```yaml
id: LEADS-PRE-CODING-GATE
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - INTENT.md
  - PROJECT_INVARIANTS.md
  - PLAN.md
downstream:
  - EXECUTION_PLAN.md
  - READINESS_GATES.md
  - STATUS.md
```

## Purpose

This gate prevents coding from starting when the selected task lacks preserved intent, data-safety handling, contract impact review, or validation evidence.

## Required Inputs

- selected goal from `docs/orchestrator/GOALS.md` or `implementation-goals/`;
- preserved intent from `docs/orchestrator/INTENT.md`;
- project invariants from `docs/orchestrator/PROJECT_INVARIANTS.md`;
- current state from `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and `STATE.json`;
- context package for the selected task;
- execution plan for the selected task;
- coding prompt or owner-provided implementation instruction;
- validation plan with exact commands;
- sensitive-data classification;
- contract/schema impact statement;
- remote git status.

## Blocking Checks

Coding is blocked when any check fails:

- selected goal or chunk is missing;
- task does not map to preserved Leads intent;
- execution-critical context contains unresolved missing or unknown markers;
- consent, unsubscribe, confirmation, or raw lead data impact is unclear;
- AI/CRM raw data export is proposed without active owner approval;
- mass outreach, campaign execution, or notification provider behavior is proposed without active owner approval;
- public API, internal-service headers, database schema, or notification contract impact is missing;
- validation commands and expected evidence are missing;
- secret or raw production data handling is ambiguous;
- source file scope is not named;
- deployment is planned without explicit owner approval.

## Required Gate Evidence

Record this in the task execution plan or validation report:

```text
Gate: Leads pre-coding gate
Date:
Goal:
Chunk:
Repository root:
Git status:
DocsRAG query:
Execution plan:
Context package:
Coding prompt:
Invariants checked:
Sensitive-data classification:
Consent impact:
Contract/schema impact:
AI/CRM export impact:
Outreach impact:
Validation commands:
Result:
```

## DocsRAG Rule

Query DocsRAG before broad architecture, ecosystem, or cross-service work when credentials are available. If credentials are unavailable, record the limitation in `docs/orchestrator/STATUS.md` and rely on local source-of-truth docs only.

## Data-Safety Classification

Use one of:

- `none`: no data-bearing examples or runtime output.
- `synthetic`: fake lead/contact values only.
- `masked`: production-shaped values are redacted before capture.
- `sensitive`: sensitive values are involved and must not be printed, persisted, or copied into docs.

Raw production lead data is always `sensitive`.

## Gate Result Policy

- `pass`: coding may start inside the execution-plan scope.
- `pass-with-documented-risk`: coding may start only when the documented risk does not weaken protected intent or data safety.
- `fail`: do not code. Fill missing docs, split the task, or ask the owner.
