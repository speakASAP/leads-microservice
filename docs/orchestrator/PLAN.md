# Leads Implementation Plan

```yaml
id: LEADS-PLAN
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - INTENT.md
  - GOALS.md
  - PROJECT_INVARIANTS.md
downstream:
  - EXECUTION_PLAN.md
  - STATUS.md
```

## Execution Rule

Work one owner-approved goal chunk at a time. Prefer a small, complete, validated change over starting multiple tracks.

## Active Goal

Goal 1 - Intent Preservation System is complete.

## Next Goal Selection

Default next goal: Goal 2 - Lead Intake Contract And Consent Hardening.

When a user explicitly selects another task, record the selected goal, chunk, preserved intent, and reason in `docs/orchestrator/STATUS.md` before coding.

## Required Workflow

1. Read `BUSINESS.md`, `SYSTEM.md`, `AGENTS.md`, `TASKS.md`, `STATE.json`, `docs/IMPLEMENTATION_STATE.md`, and this orchestrator pack.
2. Query DocsRAG before broad architecture or ecosystem work when a token is available.
3. Select the earliest active or pending goal unless the owner selects another goal.
4. Fill or create a goal-specific execution plan, context package, coding prompt, and validation report.
5. Run the pre-coding gate and block on unresolved execution-critical gaps.
6. Implement only the selected chunk.
7. Run validation and readiness checks.
8. Append evidence to `docs/orchestrator/STATUS.md`.
9. Update `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and `STATE.json` when the goal state changes.

## Documentation-Only Validation

For documentation-only changes, run:

```bash
find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print
rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md
rg -n 'Authorization: Bearer [A-Za-z0-9_./+=:-]{12,}|(access[_-]?token|client[_-]?secret|password|private[_-]?key|confirmation[_-]?token)\s*[:=]\s*["'\'']?[A-Za-z0-9_./+=:-]{12,}' docs AGENTS.md TASKS.md implementation-goals
```

Reusable templates may contain instructional placeholders only when they are explicitly labeled as template examples, not active task evidence.

## Runtime Validation Defaults

Use the narrowest sufficient checks for the selected chunk:

```bash
npm run build
npm test
curl -s https://leads.alfares.cz/health
```

Do not run production mutation or raw lead export checks unless the owner approved the exact task and payload.
