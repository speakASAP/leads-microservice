# Goal 3: Context Package

```yaml
id: LEADS-GOAL-03-CONTEXT-PACKAGE
status: active
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete-for-implementation
upstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.execution-plan.md
downstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.coding-prompt.md
```

## Task Summary

Make raw lead list/detail retrieval controlled, preserve the max-30 list bound, and validate trusted internal-service header behavior with focused tests.

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
- DocsRAG HTTP 200 context from the Leads runtime pod.

## Relevant Files

- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/dto/lead-query.dto.ts`
- `src/leads/dto/update-lead-preferences.dto.ts`
- `src/leads/guards/internal-service.guard.ts`
- `src/leads/guards/internal-service.guard.spec.ts`
- `package.json`

## Current Behavior

- `GET /api/leads` calls `listLeads` and currently returns raw lead rows with contact methods.
- `GET /api/leads/:id` calls `getLeadById` and currently returns raw lead detail with contact methods and submissions.
- Internal preference read/update and unsubscribe routes already use `InternalServiceGuard`.
- `listLeads` clamps page size with `Math.min(query.limit || 30, 30)`.
- `InternalServiceGuard` checks `x-internal-service-token` and, when `TRUSTED_INTERNAL_SERVICES` is configured, requires `x-service-name` to be listed.

## Required Behavior

- Raw list/detail retrieval must require trusted internal-service access.
- Public intake and confirmation must remain public.
- Internal preference and unsubscribe routes must remain guarded.
- List retrieval must keep the max-30 bound.
- Tests and docs must use synthetic values only.

## Constraints

- Do not print or persist secrets, real contact details, raw lead rows, confirmation tokens, private URLs, or production payloads.
- Do not run production mutation tests.
- Do not change consent, unsubscribe, or confirmation semantics.
- Do not increase list limits or timeouts.
- Do not change schema or deploy.

## Known Risks

- This is a public contract tightening for raw retrieval. Mitigation: the Goal 3 acceptance criterion explicitly requires raw lead retrieval to stop being public unless owner-approved and documented, and no owner approval for public raw retrieval exists in the active task.

## Validation Commands

- `npm test -- --runTestsByPath src/leads/leads.controller.spec.ts src/leads/leads.service.spec.ts src/leads/guards/internal-service.guard.spec.ts`
- `npm run build`
- missing-marker scan over IPS docs
- secret/raw-data scan over changed docs/tests
