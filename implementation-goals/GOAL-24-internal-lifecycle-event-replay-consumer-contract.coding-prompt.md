# Goal 24 Coding Prompt

Implement only Goal 24 - Internal Lifecycle Event Replay Consumer Contract in `/home/ssf/Documents/Github/leads-microservice` on `alfares`.

Allowed edits:

- `implementation-goals/GOAL-24-*` artifacts.
- lifecycle replay contract builder/types under `src/leads/integrations/`.
- focused lifecycle replay tests.
- append-only/shared status updates after validation.

Requirements:

- One-lead scoped replay request.
- Consumer constrained to existing lifecycle route membership.
- Maximum replay limit 30.
- Deterministic replay output.
- Payload reconstruction through event-type allowlists.
- Explicit Leads evidence owner and Logging centralized log owner fields.
- Omit contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, and campaign content.
- No controller or route changes.

Validation:

- Focused Jest replay contract tests.
- `npm run build`.
- Missing-marker scan.
- Sensitive-pattern scan over Goal 24 files and replay source/tests.

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
