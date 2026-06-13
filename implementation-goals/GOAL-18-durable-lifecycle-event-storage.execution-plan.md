# Goal 18 Execution Plan

## Selected Goal

Goal 18 - Durable Lifecycle Event Storage, chunk 18.1 selected and completed as a planning/readiness slice. Runtime implementation should proceed with chunk 18.2 only after this plan is accepted.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake, confirmation, preference, and unsubscribe evidence owner. Durable lifecycle storage records minimized lead lifecycle facts for replay and audit without exporting raw lead data or taking over Auth, Marketing, Notifications, CRM, Logging, database infrastructure, or AI ownership.

## Goal Impact

This slice advances the lifecycle runtime path from transient logging/routing to durable, replayable event evidence. It is selected ahead of Auth-backed admin authentication because event persistence has known local contracts and source boundaries, while Auth admin implementation still needs exact Auth claim and tenant mapping evidence.

## Gate Review

- Gate: Leads pre-coding gate
- Date: 2026-06-13
- Goal: Goal 18 - Durable Lifecycle Event Storage
- Chunk: 18.1 selection and artifacts; future chunks 18.2-18.6 for runtime implementation
- Repository root: `/home/ssf/Documents/Github/leads-microservice`
- Git status: to be recorded in validation report
- DocsRAG query: in-cluster query returned HTTP 200 for durable lifecycle storage versus Auth admin constraints; token value was not printed
- Execution plan: this file
- Context package: `implementation-goals/GOAL-18-durable-lifecycle-event-storage.context-package.md`
- Coding prompt: `implementation-goals/GOAL-18-durable-lifecycle-event-storage.coding-prompt.md`
- Invariants checked: LEADS-INV-001 through LEADS-INV-010
- Sensitive-data classification: minimized/synthetic for tests; no production raw lead data
- Consent impact: lifecycle events preserve consent evidence presence and state without changing consent semantics
- Contract/schema impact: future chunk requires Prisma schema and migration; no source/schema change in chunk 18.1
- AI/CRM export impact: no AI/CRM export; future retrieval remains minimized and guarded
- Outreach impact: no outreach automation or campaign execution
- Validation commands: documentation scans for chunk 18.1; future tests/build/Prisma checks for source chunks
- Result: pass for selection/artifacts; runtime coding is allowed only inside named future chunk scope

## Invariant Impact

- LEADS-INV-001: strengthened by persisting Leads-owned lifecycle evidence for non-registered leads.
- LEADS-INV-002: preserved; Auth, Marketing, Notifications, CRM, Logging, database infrastructure, and AI remain outside Leads ownership.
- LEADS-INV-003: preserved; stored events carry consent evidence presence/state only and do not reinterpret consent.
- LEADS-INV-004: high impact; persistence must prove raw lead data, contact values, tokens, and private URLs are omitted.
- LEADS-INV-005: preserved; no campaign send or outreach loop.
- LEADS-INV-006: preserved; public intake remains unchanged.
- LEADS-INV-007: affected for retrieval; lifecycle event retrieval must stay guarded and one-lead scoped.
- LEADS-INV-008: preserved; no notification delivery behavior change.
- LEADS-INV-009: preserved; AI/CRM receive no raw export.
- LEADS-INV-010: satisfied by this execution pack and continuation updates.

## Sensitive-Data Classification

Classification: minimized for persisted lifecycle events, synthetic for tests. Raw production lead rows, contact values, raw messages, confirmation tokens, full private URLs, metadata values, consent source values, JWTs, session tokens, and campaign content must not be printed, stored in docs, or included in lifecycle event payloads.

## Consent Impact

Durable storage preserves consent, confirmation, preference, and unsubscribe lifecycle evidence as minimized booleans/timestamps/counts. It must not change intake validation, marketing consent semantics, confirmation state, unsubscribe behavior, or preference update behavior.

## Contract/Schema Impact

Chunk 18.1 is documentation/selection only. Future runtime chunks will require a Prisma schema migration for a `LeadLifecycleEvent`-style table, Prisma client generation, and a guarded retrieval contract. Public API response shapes must remain unchanged.

## Replay/Determinism Impact

Future implementation must use deterministic idempotency keys already present in lifecycle event envelopes. Persistence must be idempotent by event or transition key so retries do not create duplicate lifecycle records.

## Scope

- Select durable lifecycle event storage as the next runtime slice.
- Create Goal 18 execution artifacts.
- Define future runtime scope, non-goals, and validation requirements.
- Update continuation state.

## Non-Goals

- No Prisma migration in chunk 18.1.
- No runtime source edits in chunk 18.1.
- No Auth-backed admin login or JWT validation implementation.
- No campaign execution, notification dispatch, CRM workflow, AI export, raw lead export, production lead mutation, or deployment.

## Files To Inspect

- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/leads/integrations/lifecycle-events.ts`
- `src/leads/integrations/lifecycle-event-router.service.ts`
- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/leads.module.ts`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md`

## Files To Modify In Future Runtime Chunks

Expected scope for chunks 18.2-18.5:

- `prisma/schema.prisma`
- `prisma/migrations/<timestamp>_add_lead_lifecycle_events/migration.sql`
- `src/leads/integrations/lifecycle-event-router.service.ts`
- `src/leads/integrations/lifecycle-event-router.service.spec.ts`
- `src/leads/leads.controller.ts`
- `src/leads/leads.controller.spec.ts`
- `src/leads/leads.module.ts`
- possible local DTO/service files if needed for guarded retrieval
- Goal 18 validation/status files

## Validation Plan

Chunk 18.1:

- `find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print`
- `rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`
- secret-pattern scan across docs, TASKS, AGENTS, and implementation-goals

Future runtime chunks:

- `npm run prisma:generate`
- `npm test -- --runTestsByPath src/leads/integrations/lifecycle-event-router.service.spec.ts src/leads/leads.controller.spec.ts`
- `npm test`
- `npm run build`
- missing-marker scan
- secret-pattern scan

## Rollback Plan

For chunk 18.1, revert only the Goal 18 documentation and continuation-state edits. For future runtime chunks, rollback must include the Prisma migration, schema changes, router persistence changes, retrieval endpoint, and tests while preserving validation evidence in status history.
