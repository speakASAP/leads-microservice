# Goal 19 Execution Plan

Selected goal: Auth-backed admin API authentication.

Gate: pass with documented tenant-scope follow-up. Auth claim contract defines Auth POST /auth/validate, user id/email/type/roles, and role authority. It does not define Leads tenant/workspace mapping, so this slice implements role-gated masked admin APIs only and does not claim tenant isolation.

Sensitive-data classification: minimized/masked. Auth tokens are sensitive and must never be logged or persisted.

Files to modify: src/auth/admin-auth.guard.ts, src/auth/admin-auth.guard.spec.ts, src/leads/admin-leads.controller.ts, src/leads/admin-leads.controller.spec.ts, src/leads/leads.service.ts, src/leads/leads.service.spec.ts, src/leads/leads.module.ts, public/admin.js, public/admin.html, docs/state artifacts.

Validation: focused admin auth tests, focused leads service/controller tests, full tests, build, lint, scans, migration deploy, app deploy, health check.
