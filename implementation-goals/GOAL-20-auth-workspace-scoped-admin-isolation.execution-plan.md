# Goal 20 Execution Plan

Selected goal: Auth Workspace-Scoped Admin Isolation.

Upstream traceability:

- docs/orchestrator/INTENT.md
- docs/orchestrator/PROJECT_INVARIANTS.md
- docs/orchestrator/READINESS_GATES.md
- implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md
- implementation-goals/GOAL-19-auth-backed-admin-api-authentication.md
- auth-microservice/docs/UNIFIED_AUTH_CONTRACT.md
- auth-microservice/docs/CONSUMER_JWT_VALIDATION_STANDARD.md

Pre-coding gate: pass with selected mapping decision. Auth documents user id, email, type, roles, and token validation. It does not define a workspace database model or guaranteed workspace claim. Leads therefore supports optional workspace/tenant claims and existing Auth app role strings as scope keys, then constrains non-global admin reads through Vault-backed LEADS_ADMIN_WORKSPACE_SOURCE_MAP.

Invariant review:

- LEADS-INV-001 preserved: Leads still owns non-registered lead records and admin read shaping.
- LEADS-INV-002 preserved: Auth remains identity/RBAC authority; Leads only consumes Auth validation output.
- LEADS-INV-003 preserved: consent fields are not changed or reinterpreted.
- LEADS-INV-004 strengthened: non-global admin reads are scoped and still minimized.
- LEADS-INV-005 preserved: no outreach automation.
- LEADS-INV-006 preserved: max admin list limit remains 30.
- LEADS-INV-007 preserved: internal service routes unchanged.
- LEADS-INV-008 unchanged: no notification behavior.
- LEADS-INV-009 unchanged: no AI/CRM export.
- LEADS-INV-010 satisfied by this artifact and status update.

Sensitive-data classification: Auth bearer tokens, raw contact values, raw messages, confirmation tokens, private source paths/query values, raw consent source values, production lead rows, and secrets remain sensitive and must not be logged or recorded.

Contract impact: admin APIs now require a configured workspace, tenant, or Auth role scope for non-global admins. global:superadmin remains unscoped. Scope-to-sourceService mapping is configured by Vault-backed LEADS_ADMIN_WORKSPACE_SOURCE_MAP.

Validation commands:

- npm test -- --runTestsByPath src/auth/admin-auth.guard.spec.ts src/leads/admin-leads.controller.spec.ts src/leads/leads.service.spec.ts
- npm run build
- npm run lint
- npm test
- missing-marker scan
- bearer-token scan
- deployment health and admin smoke after deploy

