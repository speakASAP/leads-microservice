# Leads Implementation Orchestrator

```yaml
id: LEADS-IMPLEMENTATION-ORCHESTRATOR
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - ../BUSINESS.md
  - ../SYSTEM.md
  - orchestrator/MASTER_PROMPT.md
downstream:
  - IMPLEMENTATION_STATE.md
  - orchestrator/STATUS.md
  - ../implementation-goals/
```

## Command

When the owner says `LEADS ORCHESTRATOR: continue implementation`, continue from `docs/IMPLEMENTATION_STATE.md` and the active or earliest pending goal in `docs/orchestrator/GOALS.md`.

## Mission

Coordinate future Leads work so implementation preserves the original lead-intake, consent, privacy, and ecosystem-boundary intent from task selection through validation and handoff.

## Required Reading

1. `BUSINESS.md`
2. `SYSTEM.md`
3. `AGENTS.md`
4. `TASKS.md`
5. `STATE.json`
6. `docs/IMPLEMENTATION_STATE.md`
7. `docs/orchestrator/MASTER_PROMPT.md`
8. `docs/orchestrator/INTENT.md`
9. `docs/orchestrator/GOALS.md`
10. `docs/orchestrator/PLAN.md`
11. `docs/orchestrator/PROJECT_INVARIANTS.md`
12. `docs/orchestrator/PRE_CODING_GATE.md`
13. `docs/orchestrator/READINESS_GATES.md`
14. `docs/orchestrator/STATUS.md`

## Coordinator Duties

- Select one goal chunk.
- Preserve intent and ownership boundaries.
- Build a minimal context package.
- Fill an execution plan.
- Create or select a coding prompt.
- Run the pre-coding gate.
- Delegate or implement only the selected chunk.
- Validate with evidence.
- Update status and continuation state.

## Worker Contract

Workers must receive:

- preserved intent;
- selected goal and chunk;
- exact allowed file scope;
- non-goals;
- invariant review;
- sensitive-data classification;
- consent impact;
- contract impact;
- replay/determinism impact;
- validation commands;
- expected evidence.

If these fields are missing for execution-critical behavior, create a blocker instead of coding.

## Validation Contract

Validation must answer:

- Did the change preserve Leads intent?
- Were consent, unsubscribe, confirmation, and raw lead data handled correctly?
- Were API, schema, notification, logging, AI, or CRM contracts changed or preserved?
- Were tests/build/smoke checks run and recorded?
- Were secrets and production lead data kept out of docs and output?
- Is the next action clear?
