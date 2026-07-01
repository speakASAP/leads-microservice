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

Plan for parallel execution first, then assign one unblocked goal track per worker session. Prefer independent, complete, validated goal tracks with explicit blockers and file ownership over a single serialized queue.

Runtime implementation within a worker remains single-track: one worker implements one assigned goal or chunk, validates it, and records evidence before taking another.

## Active Goal

Goals 22, 23, 24, 25, 26, 27, and 28 are complete for their current approved scopes. Goal 24/25/26 integration is deployed as `goal24-26-integration-20260615`. Goal 21 remains complete and deployed.

## Next Goal Selection

Default next action: monitor post-deploy health and select the next owner-approved goal track.

When a user explicitly selects another task, record the selected goal, chunk, preserved intent, dependencies, blockers, allowed file scope, and reason in `docs/orchestrator/STATUS.md` before coding.

## Parallel Planning Gate

Before source edits, the coordinator must classify every candidate goal:

- `parallel-ready`: independent enough for a separate agent now.
- `blocked`: cannot start until a named blocker is resolved.
- `serialized`: safe only after another active/pending goal merges because of shared files, schema, migration, runtime config, deployment, or production validation.
- `needs-owner-selection`: technically possible but requires owner priority or approval.

For each `parallel-ready` goal, record:

- owning agent/session;
- exact file scope;
- non-goals;
- upstream traceability;
- invariant, consent, sensitive-data, contract, and replay/determinism impacts;
- validation commands;
- expected evidence;
- merge/deploy sequencing.

## Parallel Execution Board

Current baseline: Goals 1-28 are complete for their current approved scopes and deployed where deployment was approved. Goal 29 contract guard/tests and transport-independent handler are complete for the Orders Goal 7.4 Leads lane, but live RabbitMQ adapter code is implemented but disabled pending production wiring and replay validation. Goal 24/25/26 integration deployed on 2026-06-15 with image digest `sha256:0134667f366f105cd7ec4651bf8f5823ab047508758678b3f29cc0f8b37bd204`.

### Active Assigned Tracks

| Goal | Track | Owner | Status | Allowed scope | Blockers | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| None | No active assigned track | Coordinator | idle | Select next owner-approved goal | None | Post-deploy health monitoring |

### Completed Parallel Tracks

| Goal | Track | Owner | Evidence |
| --- | --- | --- | --- |
| Goal 22 | Production Auth Workspace Token Matrix Validation | Agent A | Complete on 2026-06-15 with masked global and non-global token matrix validation; token values were not printed or persisted. |
| Goal 24/25/26 | Integrated replay, approval evidence storage, and product-app matrix release | Coordinator | Deployed on 2026-06-15 as `goal24-26-integration-20260615`; migration applied, health passed, admin 401 smoke passed, admin page smoke passed. |
| Goal 23 | Admin UI Scope Messaging And Empty-State Hardening | Agent B | Complete and deployed through Goal 28. |
| Goal 27 | Documentation Ingestion And Orchestrator Freshness | Agent F | Documentation-only validation passed; DocsRAG ingestion returned HTTP 202; retrieval returned HTTP 500 after ingestion and is recorded as a DocsRAG runtime limitation. |
| Goal 28 | Parallel Integration Validation And Deployment Readiness | Coordinator | Integration validation passed; accumulated Goal 23-26 changes deployed as goal23-26-integration-20260613. |
| Goal 29 | Orders Event Consumer Contract For Leads | Goal 7.4 Leads integration owner | Contract guard/tests, transport-independent handler, and disabled-by-default live broker adapter complete; production enablement blocked by secret/config wiring and replay validation. |

### Serialized Or Blocked Tracks

| Track | Reason | Unblocks |
| --- | --- | --- |
| Prisma schema or migration work | Only one migration owner at a time to avoid migration ordering conflicts | Any future durable audit, approval, or CRM runtime storage goal |
| Deployment config changes | Vault/env/deployment changes affect the single production service | Runtime goals needing env flags, Auth URLs, or source maps |
| Production lead mutation validation | Requires explicit owner approval and synthetic payload plan | Public intake, confirmation, unsubscribe, and admin smoke tests that would mutate production |
| Raw contact reveal expansion | Requires owner approval, exact purpose, retention, and audit evidence | Any CRM, AI, or Marketing handoff needing raw contact values |
| Goal 29 live Orders broker enablement | `[MISSING: production LEADS_ORDERS_EVENTS_RABBITMQ_URL/Vault/K8s wiring and broker smoke approval]`; `[MISSING: replay/backfill validation source for missed Orders events]` | Enable opt-in RabbitMQ `orders.order.created.v1` adapter and broker smoke |

### Assignment Rules

- Keep one agent per row in `Active Assigned Tracks`.
- Do not let two agents edit the same source file family at the same time.
- Merge documentation/test-only goals before runtime goals that depend on their contracts.
- Run deployment only after all runtime tracks intended for the release are merged and readiness evidence is complete.

## Required Workflow

1. Read `BUSINESS.md`, `SYSTEM.md`, `AGENTS.md`, `TASKS.md`, `STATE.json`, `docs/IMPLEMENTATION_STATE.md`, and this orchestrator pack.
2. Query DocsRAG before broad architecture or ecosystem work when a token is available.
3. Refresh active sessions, blockers, and file ownership before selecting work.
4. Prefer the earliest `parallel-ready` assigned goal from the execution board. If multiple are available, choose the one with no shared file scope with active sessions unless the owner selects another goal.
5. Fill or create a goal-specific execution plan, context package, coding prompt, and validation report.
6. Run the pre-coding gate and block on unresolved execution-critical gaps.
7. Implement only the selected chunk.
8. Run validation and readiness checks.
9. Append evidence to `docs/orchestrator/STATUS.md`.
10. Update `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, `STATE.json`, and the parallel execution board when the goal state changes.

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
