# Goal 11 Context Package - Ecosystem Lead Lifecycle Contracts

```yaml
id: LEADS-GOAL-11-CONTEXT-PACKAGE
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
  - ../BUSINESS.md
  - ../SYSTEM.md
downstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md
```

## Selected Goal

Goal 11 - Ecosystem Lead Lifecycle Contracts.

## Source Context Reviewed

- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/orchestrator/MASTER_PROMPT.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `docs/orchestrator/CONTEXT_PACKAGE.md`
- `docs/orchestrator/EXECUTION_PLAN.md`
- `docs/orchestrator/READINESS_GATES.md`
- `docs/orchestrator/PROMPTS.md`
- `docs/orchestrator/STATUS.md`
- `BUSINESS.md`
- `SYSTEM.md`
- `TASKS.md`
- `STATE.json`
- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/integrations/ai-crm-payload.ts`
- `src/leads/guards/internal-service.guard.ts`
- `src/notifications/notifications.service.ts`
- `src/logging/logging.service.ts`
- `prisma/schema.prisma`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md`

## DocsRAG Evidence

DocsRAG retrieval was run from the in-cluster Leads runtime pod because the plain SSH shell does not expose `JWT_TOKEN`. The query returned HTTP 200 for ecosystem lifecycle and marketing contract context in chunk 11.1 and again for chunk 11.2 lifecycle event/API shapes. Token values were not printed.

Relevant retrieved context reinforced that Marketing contract work already depends on leads contact preferences and consents, notifications channel registry, auth user marketing preferences, and inter-service API contracts.

## Current Leads Behavior

- Public intake: `POST /api/leads/submit`.
- Public confirmation: `GET /api/leads/confirm/:token`.
- Guarded list/detail retrieval: `GET /api/leads`, `GET /api/leads/:id`.
- Guarded preferences/unsubscribe: internal preferences and unsubscribe routes.
- Contact methods currently support `email`, `telegram`, and `whatsapp`.
- Affirmative marketing consent requires source and captured timestamp.
- List limit remains capped at 30.
- Sanitized AI/CRM context builder omits contact values, raw messages, confirmation tokens, private URL path/query, metadata values, and consent source value.
- Goal 10 landing/admin pages exist in source but are not deployed until owner approval.

## Service Boundary Summary

Leads remains the non-registered warm-contact ledger. Auth owns registered identity and RBAC. Marketing owns campaign execution. Notifications owns delivery mechanics. CRM should own funnel workflow once implemented. Billing owns paid-customer facts. AI receives minimized/redacted context only when approved.

## Sensitive Data Classification

`none` for this documentation chunk. The plan contains no real contact details, production lead rows, confirmation tokens, private URLs, secrets, or raw lead payloads.

## Chunk 11.2 Context Additions

- Existing product intake direction is `POST /api/leads/submit`; runtime changes are deferred.
- Existing guarded list/detail endpoints can return raw lead fields, so ecosystem lifecycle contracts must use new minimized event/API builders rather than exposing those responses directly to Marketing, CRM, Auth, product apps, or AI.
- Existing sanitized AI/CRM payload helper provides a useful minimization baseline: source host, message length, contact method types/count, metadata keys, consent evidence presence, preference counts, and lifecycle booleans.
- DocsRAG context confirms Marketing expects contact data and channel preferences from Leads for non-registered contacts, but Goal 11 contracts split eligibility preview from raw contact resolution so Marketing cannot receive raw contact values before approval and consent checks.
