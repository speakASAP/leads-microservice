# GOAL-10: Coding Prompt - Leads Frontend Landing And Admin Pages

```yaml
id: LEADS-GOAL-10-CODING-PROMPT
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-10-leads-frontend-pages.context-package.md
  - GOAL-10-leads-frontend-pages.execution-plan.md
downstream:
  - GOAL-10-leads-frontend-pages.validation-report.md
```

## Task Summary

Implement static frontend pages for Leads: a customer landing page and an admin dashboard shell.

## Allowed Changes

- Add `public/` HTML/CSS/JS assets.
- Configure Nest bootstrap to serve `/`, `/admin`, and static assets while preserving `/api` routes.
- Copy `public/` into the Docker runtime image.
- Update IPS evidence docs.

## Forbidden Changes

- Do not export raw lead data.
- Do not trigger mass outreach.
- Do not weaken consent, confirmation, preference, or unsubscribe evidence.
- Do not alter Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.
- Do not print or persist secrets, real contact details, confirmation tokens, or raw production lead rows.
- Do not deploy without owner approval.

## Acceptance Criteria

- `/` renders landing content and request-access form.
- `/admin` renders admin dashboard shell.
- Admin dashboard loads data only after a token is supplied and masks contact values.
- `npm run build` and `npm test` pass.
