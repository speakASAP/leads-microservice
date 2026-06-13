# Goal 5 - AI And CRM Data-Sharing Boundary: Context Package

```yaml
id: LEADS-GOAL-05-CONTEXT-PACKAGE
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-05-ai-and-crm-data-sharing-boundary.execution-plan.md
downstream:
  - GOAL-05-ai-and-crm-data-sharing-boundary.coding-prompt.md
```

## Task Summary

Document the current and intended AI/CRM data-sharing boundary for Leads. The task is documentation-only because source inspection found configuration/documentation references to AI and CRM follow-up, but no implemented AI client or CRM-specific client in the Leads runtime source.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/GOALS.md`
- DocsRAG retrieval for AI/CRM boundary context

## Relevant Files

- `.env.example`
- `README.md`
- `CLAUDE.md`
- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/guards/internal-service.guard.ts`
- `src/logging/logging.service.ts`
- `prisma/schema.prisma`
- Goal 2, Goal 3, and Goal 4 implementation artifacts

## Current Behavior

- `AI_SERVICE_URL` is configured in `.env.example` and listed in `SYSTEM.md`, but no source code calls the AI microservice.
- `README.md`, `BUSINESS.md`, and `CLAUDE.md` describe CRM and AI analysis as intended follow-up support, but no CRM-specific client or export endpoint exists in source.
- `GET /api/leads`, `GET /api/leads/:id`, and internal preference/unsubscribe routes are guarded by `InternalServiceGuard`.
- `getLeadById` can return contact methods and submissions to trusted internal callers; this is sensitive raw lead access and must not become bulk AI/CRM export without approval.
- `getLeadPreferences`, `updateLeadPreferences`, and `unsubscribeLead` expose/minimize consent and preference state for trusted services.
- `LoggingService` sends operational metadata only when callers avoid raw meta. Current controller logs use IDs, source service, counts, page/limit, timestamps, and duration, not raw messages/contact values.

## DocsRAG Context

DocsRAG returned HTTP 200 and reinforced these source-of-truth points:

- Leads constraints include GDPR consent tracking, no raw lead data export without owner approval, no mass outreach without human review, and notifications through notifications-microservice.
- Marketing-microservice reads Leads contact, preference, and consent fields for non-registered contacts.
- Marketing-microservice must only target leads with explicit marketing consent.
- Marketing owns campaign orchestration, recipient decisions, and execution outcomes; Leads owns lead preference and consent data.

## Required Behavior

- AI/CRM integrations use minimized or redacted context by default.
- Raw lead export requires explicit owner approval in the active task with fields, destination, retention, volume, and validation evidence.
- Future prompts, logs, screenshots, validation reports, and integration payload captures exclude raw contact values, raw messages, metadata values, confirmation tokens, source URL paths/query strings, private URLs, secrets, production rows, and CRM records unless explicitly approved and masked as required.
- Campaign execution and mass outreach remain outside Leads and require human review.

## Constraints

- No raw production lead data, secrets, confirmation tokens, private URLs, or CRM records in docs or prompts.
- No public API, internal-service header, schema, logging, notification, AI, or CRM runtime contract changes in this chunk.
- No deployment.
- No production reads or mutations.

## Known Risks

- Existing raw list/detail endpoints can expose sensitive fields to trusted internal callers. Mitigation: access remains guarded, max list limit remains 30, and future AI/CRM use must prefer minimized preference endpoints or explicit owner-approved field scopes.
- `AI_SERVICE_URL` may imply an integration that is not implemented. Mitigation: document that no AI client exists today and split future implementation into approval-gated chunks.
- CRM is mentioned in docs without a concrete integration contract. Mitigation: document no current CRM client exists and require future CRM export design before runtime code.

## Validation Commands

- `find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print`
- `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`
- Secret-pattern scan across `docs`, `AGENTS.md`, `TASKS.md`, and `implementation-goals`.
- `npm run build`
