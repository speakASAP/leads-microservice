# Goal 18 Context Package

## Task Summary

Select durable lifecycle event storage as the next Leads runtime slice and prepare the implementation context for persisting minimized lifecycle event envelopes. This follows completed lifecycle builders, controller adoption, routing, Auth conversion linkage, Marketing eligibility preview, and controlled contact resolution.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md`
- `implementation-goals/GOAL-15-lifecycle-routing-auth-conversion-linkage.md`
- `implementation-goals/GOAL-17-controlled-contact-resolution.md`

## DocsRAG Evidence

Queried DocsRAG from the in-cluster Leads runtime pod because the plain SSH shell does not expose `JWT_TOKEN`. The query returned HTTP 200 for durable lifecycle storage versus Auth-backed admin authentication constraints. Token values were not printed. Retrieved context reinforced that Auth owns login, JWT issuance, roles, and identity boundaries, supporting the decision to defer Auth-backed admin source work until exact Auth claim names and tenant mapping are confirmed.

## Relevant Files

- `prisma/schema.prisma`: current Lead, LeadContactMethod, and LeadSubmission models; no lifecycle event table yet.
- `prisma/migrations/`: existing migrations for initial schema, marketing preferences/consent, and confirmation token.
- `src/leads/integrations/lifecycle-events.ts`: minimized event builders and deterministic envelope fields.
- `src/leads/integrations/lifecycle-event-router.service.ts`: current transient route logging through `LoggingService`.
- `src/leads/leads.controller.ts`: public and guarded flows that build and route lifecycle events.
- `src/leads/leads.module.ts`: provider wiring.

## Current Behavior

Lifecycle events are built as minimized envelopes and routed through `LeadLifecycleEventRouterService`. The router logs the event and route metadata through the logging integration, but Leads has no durable local lifecycle event table and no guarded lifecycle event retrieval endpoint. Existing source state explicitly excludes a durable event table from Goals 13-17.

Auth-backed admin access is contract-defined but not source-ready. The contract requires exact Auth claim names, issuer/audience semantics, role claim shape, active workspace semantics, and tenant mapping before implementation.

## Required Behavior For Future Runtime Chunks

- Persist minimized lifecycle event envelopes durably in Leads storage.
- Enforce idempotency by event or lifecycle transition key.
- Keep logging metadata-only and separate from durable storage ownership.
- Add guarded one-lead lifecycle event retrieval using the Goal 11 contract.
- Preserve public API response shapes and existing lifecycle side effects.

## Constraints

- Store minimized lifecycle event envelopes only.
- Do not store contact values, raw messages, confirmation tokens, full private URLs, metadata values, raw consent source values, JWTs, session tokens, or campaign content in lifecycle event records.
- Retrieval must be guarded by `InternalServiceGuard` and scoped to one lead.
- Do not implement Auth login, JWT validation, or tenant scoping in Goal 18.
- Do not trigger campaign sends, notification dispatch, CRM workflow, AI export, raw lead export, production mutation, or deployment.

## Known Risks

- Prisma migration requires careful production rollout planning and validation.
- JSON event payloads must stay minimized even if future builders change.
- Idempotency must be deterministic to avoid duplicate records on retries.
- Retrieval must not become a broad raw lead export path.

## Validation Commands

Chunk 18.1:

- `find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print`
- `rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`
- secret-pattern scan across docs, TASKS, AGENTS, and implementation-goals

Future runtime chunks:

- `npm run prisma:generate`
- `npm test -- --runTestsByPath src/leads/integrations/lifecycle-event-router.service.spec.ts src/leads/leads.controller.spec.ts`
- `npm test`
- `npm run build`
