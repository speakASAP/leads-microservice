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
- `src/auth/admin-auth.guard.ts`
- `src/leads/admin-leads.controller.ts`
- `src/leads/leads.service.ts`

DocsRAG:

- Queried from the in-cluster Leads runtime pod using the runtime DocsRAG token path.
- Query: Leads Goal 22 production Auth workspace token matrix validation constraints.
- Result: HTTP 500. No token value was printed or persisted.
- Fallback: repo-local source-of-truth docs and production smoke checks.

Endpoint matrix:

- `GET https://leads.alfares.cz/health`: public health.
- `GET https://leads.alfares.cz/api/admin/leads`: Auth-backed admin list.
- `GET https://leads.alfares.cz/api/admin/leads/summary`: Auth-backed admin summary.
- `GET https://leads.alfares.cz/api/admin/leads/:id`: Auth-backed admin detail; not exercised without an approved safe lead id path because production lead rows must not be printed or selected from output.

Token matrix:

- No token: expected HTTP 401.
- Invalid placeholder token: expected HTTP 401.
- Existing Kubernetes candidate tokens: presence-only checked; all current candidates returned Auth HTTP 401.
- Fresh Auth login using stored test credentials: intentionally not run because the current task forbids production mutation.
- Non-global workspace/app-scoped admin token: blocked until owner provides a currently valid approved token or synthetic staging path.

Sensitive-data classification: sensitive runtime validation with masked/minimized evidence only.
