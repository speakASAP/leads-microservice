# GOAL-XX: Execution Plan Template

```yaml
id: LEADS-GOAL-XX-EXECUTION-PLAN
status: draft
owner: leads-owner
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
completeness_level: template
upstream:
  - GOAL-XX-name.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-XX-name.context-package.md
  - GOAL-XX-name.coding-prompt.md
  - GOAL-XX-name.validation-report.md
```

## Selected Goal

State the selected goal and chunk.

## Preserved Intent

State the exact Leads intent this task preserves.

## Goal Impact

Explain how this chunk advances the goal without changing owner intent.

## Invariant Impact

List affected Leads invariants and evidence required for each.

## Sensitive-Data Classification

Use `none`, `synthetic`, `masked`, or `sensitive`.

## Consent Impact

State consent, confirmation, preference, or unsubscribe impact.

## Contract/Schema Impact

State API, database, logging, notification, AI, or CRM contract impact.

## Replay/Determinism Impact

State duplicate lead, duplicate notification, confirmation, unsubscribe, retry, or idempotency impact.

## Scope

List exact behavior included.

## Non-Goals

List exact exclusions.

## Files To Inspect

List exact files.

## Files To Modify

List exact files.

## Validation Plan

List commands and expected evidence.

## Rollback Plan

State how to reverse the selected chunk without deleting evidence.
