# Leads Implementation Goals

```yaml
id: LEADS-IMPLEMENTATION-GOALS
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
downstream:
  - templates/
```

## Purpose

This directory stores durable goal records and goal-specific execution artifacts for `leads-microservice`.

## Current Goals

| Goal | Status | File |
| --- | --- | --- |
| Goal 1 - Intent Preservation System | done | `GOAL-01-intent-preservation-system.md` |
| Goal 2 - Lead Intake Contract And Consent Hardening | pending | use templates when selected |
| Goal 3 - Privacy-Safe Retrieval And Internal Access | pending | use templates when selected |
| Goal 4 - Notification And Confirmation Reliability | pending | use templates when selected |
| Goal 5 - AI And CRM Data-Sharing Boundary | pending | use templates when selected |
| Goal 6 - Operational Smoke And Documentation Ingestion | pending | use templates when selected |

## Required Artifacts For Future Coding

Before source edits for a selected goal, create or update:

- goal record: `GOAL-XX-name.md`;
- execution plan: `GOAL-XX-name.execution-plan.md`;
- context package: `GOAL-XX-name.context-package.md`;
- coding prompt: `GOAL-XX-name.coding-prompt.md`;
- validation report draft: `GOAL-XX-name.validation-report.md`.

No future coding task may start while execution-critical fields contain unresolved missing or unknown markers.
