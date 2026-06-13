# Goal 18 Coding Prompt

## Task Summary

Implement durable lifecycle event storage for Leads, starting with chunk 18.2 after the Goal 18 execution plan and context package have been reviewed.

## Required Context

Read:

- `implementation-goals/GOAL-18-durable-lifecycle-event-storage.md`
- `implementation-goals/GOAL-18-durable-lifecycle-event-storage.execution-plan.md`
- `implementation-goals/GOAL-18-durable-lifecycle-event-storage.context-package.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `src/leads/integrations/lifecycle-events.ts`
- `src/leads/integrations/lifecycle-event-router.service.ts`
- `prisma/schema.prisma`

## Allowed Changes

For runtime chunks 18.2-18.5 only:

- Add a Prisma lifecycle event model and migration for minimized lifecycle envelopes.
- Persist lifecycle events idempotently from `LeadLifecycleEventRouterService` before route metadata logging.
- Add guarded one-lead lifecycle event retrieval using `InternalServiceGuard`.
- Add focused tests proving persistence idempotency, minimized payloads, guarded retrieval, and sensitive-data omission.
- Update Goal 18 validation/status artifacts.

## Forbidden Changes

- Do not export raw lead data.
- Do not trigger mass outreach or campaign sends.
- Do not return or store contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, or campaign content in lifecycle event storage or logs.
- Do not implement Auth-backed browser admin login, JWT validation, RBAC, or tenant mapping in Goal 18.
- Do not change public API response shapes.
- Do not alter Notifications delivery mechanics, Marketing campaign ownership, CRM workflow ownership, Logging storage ownership, database infrastructure ownership, or AI ownership.
- Do not deploy without owner approval.

## Implementation Instructions

1. Record the pre-coding gate with current remote git status.
2. Add schema/migration and tests first for minimized event persistence and idempotency.
3. Wire persistence into the lifecycle router without changing lifecycle event builders unless tests prove a minimization gap.
4. Add guarded retrieval only after persistence tests pass.
5. Run focused tests, full tests, build, Prisma generation, missing-marker scan, and secret-pattern scan.
6. Update validation report, `docs/orchestrator/STATUS.md`, `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and `STATE.json`.

## Acceptance Criteria

- Durable records store minimized lifecycle event envelopes only.
- Duplicate lifecycle transitions do not create duplicate records.
- Retrieval is guarded and one-lead scoped.
- Logs remain metadata-only.
- Existing public responses and source contracts remain compatible.
- Validation evidence is recorded.

## Validation Commands

- `npm run prisma:generate`
- `npm test -- --runTestsByPath src/leads/integrations/lifecycle-event-router.service.spec.ts src/leads/leads.controller.spec.ts`
- `npm test`
- `npm run build`
- `rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`
- secret-pattern scan across docs, TASKS, AGENTS, implementation-goals, and changed source files
