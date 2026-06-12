# Leads Readiness Gates

```yaml
id: LEADS-READINESS-GATES
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - PRE_CODING_GATE.md
  - PROJECT_INVARIANTS.md
downstream:
  - STATUS.md
  - ../IMPLEMENTATION_STATE.md
```

## Purpose

Readiness gates define the checks required after implementation and before merge, deployment, or closure.

## Integration-Readiness Gate

Run this before declaring a source or contract change complete.

Required evidence:

- pre-coding gate decision;
- files changed and scope confirmation;
- invariant review result;
- sensitive-data scan result;
- consent impact result;
- contract validation result or `No Leads contract change`;
- AI/CRM export result or `No AI/CRM export`;
- outreach result or `No outreach automation`;
- test/build command results;
- known deviations or follow-ups.

## Deployment-Readiness Gate

Run this before deployment or closure when runtime behavior changed and deployment is requested.

Required evidence:

- all integration-readiness evidence;
- explicit owner approval for deployment in the active session;
- deployment command and result;
- health or reachability check;
- relevant API smoke check using synthetic or masked data only;
- confirmation that no secrets, contact details, raw messages, production lead rows, or confirmation tokens were captured.

## Documentation-Only Readiness

For documentation-only changes, deployment is not required. Evidence should include:

```bash
find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print
rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md
rg -n 'Authorization: Bearer [A-Za-z0-9_./+=:-]{12,}|(access[_-]?token|client[_-]?secret|password|private[_-]?key|confirmation[_-]?token)\s*[:=]\s*["'\'']?[A-Za-z0-9_./+=:-]{12,}' docs AGENTS.md TASKS.md implementation-goals
```

## Decision

- `accept`: all required evidence is present.
- `accept-with-follow-up`: task is complete, but a non-blocking follow-up is named.
- `block`: validation failed, invariant conflict remains, sensitive-data risk remains, consent impact is unresolved, or contract impact is unverified.

## Evidence Recording

Append a dated entry to `docs/orchestrator/STATUS.md` with:

- selected goal and chunk;
- gate decision;
- commands run;
- pass/fail summary;
- deployment details when applicable;
- next unfinished chunk.
