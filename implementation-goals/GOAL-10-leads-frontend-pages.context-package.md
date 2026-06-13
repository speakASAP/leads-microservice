# GOAL-10: Context Package - Leads Frontend Landing And Admin Pages

```yaml
id: LEADS-GOAL-10-CONTEXT-PACKAGE
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-10-leads-frontend-pages.execution-plan.md
downstream:
  - GOAL-10-leads-frontend-pages.coding-prompt.md
```

## Task Summary

Create a customer landing page and an admin dashboard shell in the Leads service while preserving consent, privacy, and ownership boundaries.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- DocsRAG retrieval for frontend/admin/consent boundaries

## Relevant Files

- `src/main.ts`
- `Dockerfile`
- `public/index.html`
- `public/admin.html`
- `public/styles.css`
- `public/landing.js`
- `public/admin.js`
- `src/leads/leads.controller.ts`
- `src/leads/guards/internal-service.guard.ts`

## Current Behavior

The service was API-only. `/api/leads` retrieval is guarded by `InternalServiceGuard`; public intake is available at `/api/leads/submit`.

## Required Behavior

Serve a polished landing page at `/` and an admin shell at `/admin`. Admin data must remain protected by the existing guarded API and contact values must be masked in the browser UI.

## Constraints

No raw lead export, no mass outreach, no weakening of consent, confirmation, preference, or unsubscribe evidence, and no Auth/Notifications/Marketing/Logging/AI ownership drift.
