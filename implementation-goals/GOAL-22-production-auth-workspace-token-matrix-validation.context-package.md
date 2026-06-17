# Goal 22 Context Package

Goal: Production Auth Workspace Token Matrix Validation.

Preserved intent:

- Leads owns non-registered lead intake, consent, confirmation, preferences, unsubscribe state, and privacy-preserving lead views.
- Auth owns identity, JWT validation, roles, and workspace/tenant or app-role scope claims.
- Leads admin APIs must remain Auth-backed and masked/minimized; non-global admin reads must be scoped by the deployed Goal 20 mapping.

Source context reviewed:

- `AGENTS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PRE_CODING_GATE.md`
- `docs/orchestrator/READINESS_GATES.md`
- `docs/orchestrator/STATUS.md`
- `implementation-goals/GOAL-19-auth-backed-admin-api-authentication.validation-report.md`
- `implementation-goals/GOAL-20-auth-workspace-scoped-admin-isolation.md`
- `implementation-goals/GOAL-20-auth-workspace-scoped-admin-isolation.validation-report.md`
- `implementation-goals/GOAL-22-production-auth-workspace-token-matrix-validation.validation-report.md`
- `src/auth/admin-auth.guard.ts`
- `src/leads/admin-leads.controller.ts`
- `src/leads/leads.service.ts`
- Read-only Auth repo inspection: `docs/UNIFIED_AUTH_CONTRACT.md`, `docs/CONSUMER_JWT_VALIDATION_STANDARD.md`, `scripts/seed-rbac.ts`, `scripts/assign-role-by-email.ts`, role/user-role entities and role service.

DocsRAG:

- Queried from the in-cluster Leads runtime pod using the runtime DocsRAG token path.
- Query: Leads Goal 22 production Auth workspace token matrix validation constraints.
- Result: HTTP 500 on 2026-06-15. No token value was printed or persisted.
- Fallback: repo-local source-of-truth docs, read-only Auth repo inspection, and production smoke checks.

Endpoint matrix:

- `GET https://leads.alfares.cz/health`: public health.
- `GET https://leads.alfares.cz/api/admin/leads`: Auth-backed admin list.
- `GET https://leads.alfares.cz/api/admin/leads/summary`: Auth-backed admin summary.
- `GET https://leads.alfares.cz/api/admin/leads/:id`: Auth-backed admin detail; not exercised because list/summary validation was sufficient and detail would require a row-specific production id.

Token matrix:

- No token: HTTP 401.
- Invalid placeholder token: HTTP 401.
- Existing Kubernetes candidate tokens from prior check: presence-only checked; rejected by Auth HTTP 401.
- Owner-approved synthetic global Auth validation token: Auth POST validation HTTP 201 with valid true; Leads summary/list HTTP 200.
- Owner-approved synthetic non-global app-admin token: Auth POST validation HTTP 201 with valid true; Leads summary/list HTTP 200; out-of-scope source filter returned HTTP 200 with zero items.

Sensitive-data classification: sensitive runtime validation with masked/minimized evidence only.
