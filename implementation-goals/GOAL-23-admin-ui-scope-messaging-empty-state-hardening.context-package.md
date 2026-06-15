# Goal 23: Context Package

```yaml
id: LEADS-GOAL-23-CONTEXT-PACKAGE
status: ready
owner: Agent B
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: sufficient-for-coding
upstream:
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.execution-plan.md
downstream:
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.coding-prompt.md
```

## Task Summary

Improve the static Leads admin browser shell so scoped admins receive clear, privacy-safe messaging for missing tokens, unauthorized access, scoped empty reads, and hidden details while preserving the existing admin API response contract.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/orchestrator/MASTER_PROMPT.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `docs/orchestrator/STATUS.md`

## Relevant Files

- `public/admin.html`
- `public/admin.js`
- `public/styles.css`
- `src/leads/admin-leads.controller.ts`
- `src/leads/leads.service.ts`
- `package.json`

## Current Behavior

- `public/admin.js` requires a token before list loading, but leaves most dashboard panels in generic empty states.
- Failed list loads surface only `Dashboard load failed with HTTP <status>` and do not distinguish unauthorized/forbidden states for operators.
- Successful zero-row list responses render `No leads match the current filters`, which does not explain scoped visibility.
- Row clicks render the list item locally and do not exercise the existing detail endpoint, so hidden detail behavior has no browser state.
- The browser currently renders `sourceLabel` or `sourceHost` where available; Goal 23 should avoid showing raw source metadata values in the browser shell.

## Required Behavior

- Missing token state explains that credentials are required before any admin read.
- HTTP 401/403 state explains that the dashboard cannot be loaded for the current admin session without exposing Auth internals or response bodies.
- Successful zero-row reads explain that no leads are visible for the current access and filters without implying another workspace exists.
- HTTP 404 detail reads explain that selected details are unavailable or no longer visible without revealing hidden records.
- The admin shell continues rendering only minimized safe fields: source service, status, contact method type/count, consent label/evidence presence, preference channel/count, and timestamps.

## Constraints

- No API, schema, Auth, Notifications, Marketing, Logging, AI/CRM, deployment, or production data changes.
- No raw contact values, raw messages, confirmation tokens, private URL path/query values, raw metadata values, tokens, or secrets in UI, tests, docs, or validation output.
- Browser screenshots, if any, must be synthetic, unauthenticated, or masked only.
- Work with the dirty remote tree without reverting unrelated changes.

## Known Risks

- DocsRAG returned HTTP 500 for this task; mitigated by narrow static UI scope and repo-local source-of-truth docs.
- Existing admin API still includes `sourceLabel` and `sourceHost`; mitigation is UI-level non-rendering without changing the API contract.
- Browser validation with real admin tokens could expose production rows; mitigation is focused Jest tests and optional unauthenticated-only browser checks.

## Validation Commands

- `npm test -- --runTestsByPath public/admin.spec.ts`
- `npm run build`
- `npm run lint`
- Sensitive-data scan across Goal 23 files and admin UI assets.
