# GOAL-XX: Validation Report Template

```yaml
id: LEADS-GOAL-XX-VALIDATION-REPORT
status: draft
owner: leads-owner
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
completeness_level: template
upstream:
  - GOAL-XX-name.execution-plan.md
downstream:
  - ../docs/orchestrator/STATUS.md
  - ../docs/IMPLEMENTATION_STATE.md
  - ../TASKS.md
  - ../STATE.json
```

## Artifact Validated

State the goal and chunk.

## Preserved Intent Evidence

State whether the result still satisfies the preserved Leads intent.

## Gate Evidence

Record the pre-coding gate result.

## Invariant Evidence

List affected invariants and validation evidence.

## Sensitive-Data Evidence

Confirm secrets, contact details, raw lead rows, confirmation tokens, private URLs, and raw production payloads were not captured.

## Consent Evidence

State consent, confirmation, preference, or unsubscribe validation evidence.

## Contract Evidence

State API, schema, logging, notification, AI, or CRM contract evidence.

## Replay/Determinism Evidence

State duplicate, retry, idempotency, or deterministic behavior evidence.

## Commands Run

List commands and results.

## Passed Criteria

List passed criteria.

## Failed Or Skipped Criteria

List failures or skips with reasons.

## Decision

Use `pass`, `fail`, or `blocked`.

## Next Action

State the next concrete action.
