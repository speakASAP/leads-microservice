# Leads Context Package

```yaml
id: LEADS-CONTEXT-PACKAGE
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - GOALS.md
  - INTENT.md
downstream:
  - EXECUTION_PLAN.md
  - PROMPTS.md
```

## Target Task

Default target: the active goal in `docs/IMPLEMENTATION_STATE.md`, then the earliest active or pending goal in `docs/orchestrator/GOALS.md`, then the owner-selected task.

## Upstream Traceability

Every task must trace to:

- Original Leads intent: `docs/orchestrator/INTENT.md`
- Current state: `docs/IMPLEMENTATION_STATE.md`
- Backlog and tasks: `docs/orchestrator/GOALS.md`, `implementation-goals/README.md`, `TASKS.md`, and `STATE.json`
- Invariants: `docs/orchestrator/PROJECT_INVARIANTS.md`
- Gates: `docs/orchestrator/PRE_CODING_GATE.md` and `docs/orchestrator/READINESS_GATES.md`

## Included Documents

Read these before coding:

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/MASTER_PROMPT.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `docs/orchestrator/EXECUTION_PLAN.md`
- `docs/orchestrator/READINESS_GATES.md`
- `docs/orchestrator/STATUS.md`
- `docs/orchestrator/PROMPTS.md`
- selected `implementation-goals/GOAL-XX-*.md`

Inspect source files only after the execution plan names the expected file scope. Prefer narrow reads over broad source-tree reading.

## Service Context

Current source-of-truth summary:

- Stack: NestJS, PostgreSQL, Prisma.
- Production: `https://leads.alfares.cz`.
- Kubernetes namespace: `statex-apps`.
- Public health endpoint: `GET /health`.
- Global API prefix: `/api`.
- Lead endpoints include `POST /api/leads/submit`, `GET /api/leads`, `GET /api/leads/:id`, `GET /api/leads/confirm/:token`, and trusted internal preference/unsubscribe routes.
- Consumers listed in docs: sgiprealestate, statex, marketing-microservice.
- Integrations listed in docs: database-server PostgreSQL, logging-microservice, auth-microservice, notifications-microservice, AI microservice.

## Excluded Context

Do not copy into docs or prompts:

- decoded Vault, Kubernetes, or environment secrets;
- raw production lead rows;
- real contact details;
- confirmation tokens;
- private source URLs or CRM records;
- production logs containing raw lead payloads;
- external AI prompts containing raw lead data unless owner-approved for the selected task.

## Allowed Documentation Changes

Documentation workflow changes may touch:

- `docs/orchestrator/`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`

Runtime changes must be named by the selected execution plan before coding.

## Forbidden Changes

Unless owner-approved for the selected task, do not:

- change public or internal API behavior;
- alter consent, unsubscribe, or confirmation semantics;
- export raw lead data to AI, CRM, logs, docs, or tests;
- increase list limits or timeouts;
- run production mutation tests;
- deploy;
- modify secrets or decoded runtime configuration.

## Validation Instructions

Before coding, run the checks in `docs/orchestrator/PRE_CODING_GATE.md`. After coding, run the relevant checks in `docs/orchestrator/READINESS_GATES.md` and record evidence in `docs/orchestrator/STATUS.md`.
