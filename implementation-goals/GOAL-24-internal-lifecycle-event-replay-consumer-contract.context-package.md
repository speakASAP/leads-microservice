# Goal 24 Context Package

## Upstream Traceability

Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation is preserved in the Goal 24 artifact set.

## Source Context Reviewed

- `BUSINESS.md`, `SYSTEM.md`, `AGENTS.md`, `TASKS.md`, `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`, `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/orchestrator/MASTER_PROMPT.md`, `INTENT.md`, `GOALS.md`, `PLAN.md`, `PROJECT_INVARIANTS.md`, `PRE_CODING_GATE.md`, `CONTEXT_PACKAGE.md`, `EXECUTION_PLAN.md`, `READINESS_GATES.md`, `PROMPTS.md`, `STATUS.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md`
- `implementation-goals/GOAL-18-durable-lifecycle-event-storage.*`
- lifecycle builder/router/service/controller files and focused tests
- `prisma/schema.prisma`

## DocsRAG

Plain SSH DocsRAG attempt returned no usable response in this session. Local repo source-of-truth docs were sufficient for the narrow docs/builders/tests scope.

## Existing Contracts

Lifecycle builders emit minimized payloads. Router persistence stores minimized events with deterministic idempotency keys where available. Existing guarded lifecycle retrieval is not changed by Goal 24.

## Constraints

Runtime route changes are blocked until owner selects first consumer. New durable storage and Prisma migration are blocked behind a migration owner. Leads serves only minimized lifecycle evidence; Logging owns centralized log storage.

## 2026-06-15 Runtime Replay Consumer Addendum

Owner selection: FlipFlop service is the first trusted internal consumer for the Goal 24 runtime replay path.

Pre-coding gate result: pass-with-documented-risk. Runtime DocsRAG retrieval from the deployed Leads pod reached DocsRAG but returned HTTP 500 for the Goal 24 FlipFlop query; the plain SSH shell still lacks JWT_TOKEN. Repo-local source-of-truth docs and existing Goal 24 artifacts were sufficient for the narrow runtime route/client scope.

Allowed Leads scope used: `src/leads/integrations/lifecycle-replay-contract.ts`, `src/leads/integrations/lifecycle-replay-contract.spec.ts`, `src/leads/dto/lifecycle-replay-query.dto.ts`, `src/leads/leads.controller.ts`, `src/leads/leads.controller.spec.ts`, `src/leads/leads.service.ts`, and `src/leads/leads.service.spec.ts`.

Runtime contract: `GET /api/leads/internal/:id/lifecycle-replay` is guarded by `InternalServiceGuard`, one-lead scoped by path `id`, accepts only `consumer=flipflop-service`, defaults purpose to `consumer_reconciliation`, and clamps replay output to `MAX_LIFECYCLE_REPLAY_EVENTS = 30`.

Invariant impact: LEADS-INV-001, LEADS-INV-003, LEADS-INV-004, LEADS-INV-007, and LEADS-INV-010 are strengthened. Replay remains minimized, consent-state-only, guarded, and evidence-backed.

Sensitive-data classification: synthetic/minimized. Tests seed synthetic contact values, raw messages, confirmation tokens, private URL path/query values, and JWT-looking strings only to assert they are omitted from replay output and logs.

Contract impact: new guarded internal replay route only. No public API, Prisma schema, migration, notification, campaign execution, AI/CRM export, raw lead export, or production mutation change.

Replay/determinism impact: service reads at most `limit + 1`, with limit clamped to 30, ordered by `occurredAt` and `eventId`; response builder maps `flipflop-service` to existing `product-apps` lifecycle route membership and omits unknown/unallowed payload fields.

Validation commands: focused Jest replay/controller/service suites, `npm run build`, FlipFlop static verifier, FlipFlop shared `tsc --noEmit`, missing-marker scan, and sensitive-pattern scan.
