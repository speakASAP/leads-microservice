# Goal 23: Coding Prompt

```yaml
id: LEADS-GOAL-23-CODING-PROMPT
status: ready
owner: Agent B
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: implementation-ready
upstream:
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.context-package.md
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.execution-plan.md
downstream:
  - GOAL-23-admin-ui-scope-messaging-empty-state-hardening.validation-report.md
```

## Task Summary

Implement Goal 23 admin UI scope messaging and empty-state hardening in the static admin shell.

## Required Context

Read Goal 23, the execution plan, the context package, `docs/orchestrator/PRE_CODING_GATE.md`, and the existing `public/admin.js` before edits.

## Allowed Changes

- `public/admin.js`: add safe token-missing, unauthorized/forbidden, scoped-empty, and hidden-detail rendering; fetch selected detail through the existing endpoint; avoid source metadata rendering.
- `public/styles.css`: add minimal static state styling if needed.
- `public/admin.spec.ts`: add focused tests with synthetic values only.
- Goal 23 artifacts and append-only status/state docs.

## Forbidden Changes

- Do not export raw lead data.
- Do not trigger mass outreach.
- Do not weaken consent, confirmation, preference, or unsubscribe evidence.
- Do not alter Auth, Notifications, Marketing, Logging, database infrastructure, AI/CRM ownership, or API contracts.
- Do not print or persist secrets, real contact details, confirmation tokens, private URLs, metadata values, or raw production lead rows.
- Do not deploy without owner approval.

## Implementation Instructions

1. Stay inside the execution-plan scope.
2. Treat HTTP 401/403 as an access-denied browser state without reading or displaying response bodies.
3. Treat HTTP 404 from the detail endpoint as hidden/unavailable detail without implying another workspace exists.
4. Treat successful zero-row list responses as scoped-empty visibility, not proof that no leads exist globally.
5. Render only safe minimized fields and escape dynamic text before writing HTML.
6. Run validation commands and update the validation report/status evidence.

## Acceptance Criteria

- Admin UI does not show raw contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, tokens, or secret material.
- Empty scoped reads and hidden details are clear to operators without revealing another workspace exists.
- No API, schema, Auth, outreach, AI/CRM, notification, or deployment behavior changes are included.

## Validation Commands

- `npm test -- --runTestsByPath public/admin.spec.ts`
- `npm run build`
- `npm run lint`
- Sensitive-data scan across Goal 23 files and admin UI assets.
