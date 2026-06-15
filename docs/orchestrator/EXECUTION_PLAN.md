# Leads Execution Plan

```yaml
id: LEADS-EXECUTION-PLAN
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - GOALS.md
  - CONTEXT_PACKAGE.md
  - PROJECT_INVARIANTS.md
downstream:
  - STATUS.md
```

## Metadata

This is the reusable Leads execution-plan frame. For each implementation chunk, update the selected goal, source scope, invariant impact, sensitive-data classification, contract impact, validation plan, and completion checklist before coding. Goal-specific execution plans may also be created from `implementation-goals/templates/EXECUTION_PLAN.md`.

## Upstream Traceability

- Original intent: `docs/orchestrator/INTENT.md`
- Current state: `docs/IMPLEMENTATION_STATE.md`
- Backlog and goal source: `docs/orchestrator/GOALS.md`, `implementation-goals/README.md`, `TASKS.md`, and `STATE.json`
- Invariants: `docs/orchestrator/PROJECT_INVARIANTS.md`
- Gates: `docs/orchestrator/PRE_CODING_GATE.md` and `docs/orchestrator/READINESS_GATES.md`

## Goal Impact

Each chunk must state how it strengthens or preserves Leads as the consent-aware non-registered lead intake service. If a task does not affect lead intake, consent, preference, notification-request, AI/CRM, or retrieval behavior, explain why it belongs in this repo before coding.

## Project Invariants

Evaluate all invariants from `docs/orchestrator/PROJECT_INVARIANTS.md`.

Minimum required entries for every chunk:

- `LEADS-INV-001`: lead intake ownership.
- `LEADS-INV-003`: consent preservation.
- `LEADS-INV-004`: raw lead data protection.
- `LEADS-INV-010`: evidence and continuation.

Add the remaining invariants whenever API access, internal service trust, notification behavior, AI/CRM export, public limits, outreach, or ownership boundaries are affected.

## Sensitive-Data Handling

Classification must be one of `none`, `synthetic`, `masked`, or `sensitive`.

Lead messages, contact methods, production lead rows, confirmation tokens, unsubscribe evidence, private source URLs, service tokens, and raw logs containing any of those values are sensitive.

## Contract Validation Plan

State whether the chunk changes or validates:

- `POST /api/leads/submit` request/response shape.
- `GET /api/leads` query or response shape.
- `GET /api/leads/:id` response shape.
- `GET /api/leads/confirm/:token` behavior.
- internal preference or unsubscribe headers and response shape.
- Prisma schema or database migration behavior.
- notifications-microservice request payloads.
- logging-microservice event shape.
- AI/CRM payloads or redaction rules.

If none apply, state `No Leads contract change`.

## Replay And Determinism Plan

State whether repeated validation can create duplicate leads, duplicate notifications, duplicate confirmation changes, or repeated unsubscribe effects. Use synthetic values and avoid production mutation unless explicitly approved.

## Scope

Define exact files and behavior included in the chunk. Keep scope to one goal chunk unless the owner explicitly expands it.

## Non-Goals

Always exclude unless owner-approved:

- registered-user identity or Auth behavior;
- notification provider mechanics;
- campaign execution or mass outreach;
- raw production lead export;
- secrets or decoded runtime configuration;
- increased timeouts or list limits;
- deployment.

## Files To Inspect

Start with the context package. Add source files only when relevant, for example:

- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/dto/create-lead.dto.ts`
- `src/leads/dto/lead-query.dto.ts`
- `src/leads/dto/update-lead-preferences.dto.ts`
- `src/leads/guards/internal-service.guard.ts`
- `src/notifications/notifications.service.ts`
- `src/logging/logging.service.ts`
- `prisma/schema.prisma`

## Files To Modify

Name exact files allowed for the selected chunk before coding.

## Implementation Steps

1. Read the context package and selected goal.
2. Restate intent and affected Leads boundary.
3. Fill scope, non-goals, invariant impact, sensitive-data classification, contract impact, replay/determinism impact, and validation plan.
4. Run the pre-coding gate.
5. Implement the smallest complete chunk.
6. Run validation and readiness checks.
7. Append evidence and next chunk to `docs/orchestrator/STATUS.md`.
8. Update `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and `STATE.json` when state changes.

## Test Plan

Use the narrowest sufficient tests:

- documentation scans for documentation-only changes;
- focused DTO or guard tests for validation/access changes;
- `npm test -- --runTestsByPath <file>` for focused backend tests;
- `npm run build` for TypeScript/backend changes;
- production reachability or smoke checks only when deployment or runtime verification is requested.

## Rollback Plan

For documentation-only changes, revert the changed docs. For code changes, use a targeted patch or normal Git revert that restores previous behavior while preserving unrelated user changes. Preserve status evidence by appending a correction rather than deleting history.

## Completion Checklist

- [ ] Selected goal and chunk named.
- [ ] Intent and boundary impact stated.
- [ ] Context package reviewed.
- [ ] Invariants evaluated.
- [ ] Sensitive-data classification stated.
- [ ] Consent impact stated.
- [ ] Contract impact stated.
- [ ] Replay/determinism impact stated.
- [ ] Validation plan stated.
- [ ] Pre-coding gate passed or exception recorded.
- [ ] Implementation complete.
- [ ] Verification evidence recorded.
- [ ] Continuation state updated.


## Goal 27 Documentation-Only Execution Addendum

Date: 2026-06-13.

Selected goal: Goal 27 - Documentation Ingestion And Orchestrator Freshness.

Scope: documentation and state only: `docs/orchestrator/*`, `docs/IMPLEMENTATION_ORCHESTRATOR.md`, `docs/IMPLEMENTATION_STATE.md`, `implementation-goals/README.md`, `TASKS.md`, `STATE.json`, and `AGENTS.md`.

Goal impact: preserves the Leads IPS chain by making active, completed, blocked, and assigned parallel work explicit after Goal 21 deployment and Goals 22-27 thread assignment.

Invariants checked: `LEADS-INV-001`, `LEADS-INV-002`, `LEADS-INV-003`, `LEADS-INV-004`, `LEADS-INV-005`, `LEADS-INV-006`, `LEADS-INV-007`, `LEADS-INV-008`, `LEADS-INV-009`, and `LEADS-INV-010` are preserved because the lane changes documentation/state only and performs no runtime mutation.

Sensitive-data classification: `none`; no data-bearing examples, tokens, secrets, raw lead rows, contact values, raw messages, confirmation tokens, private URLs, metadata values, or raw consent source values are recorded.

Consent impact: no consent, unsubscribe, confirmation, or preference semantics change.

Contract/schema impact: no API, DTO, Prisma schema, notification, Auth, Marketing, CRM, AI, deployment, or production behavior change.

Replay/determinism impact: documentation scans and DocsRAG ingestion/retrieval checks are read-only for Leads runtime data. DocsRAG ingestion refreshes documentation indexes only.

Pre-coding gate result: pass for documentation-only updates. Goal-specific `implementation-goals/GOAL-27-*` files were not created because the assigned file scope only allowed `implementation-goals/README.md`; this addendum and the status evidence serve as the execution artifacts for the documentation lane.

Validation commands: documentation file presence scan, missing-marker scan, secret-pattern scan, DocsRAG ingestion trigger, DocsRAG agent-context retrieval metadata check, and remote git status review.
