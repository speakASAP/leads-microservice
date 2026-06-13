# Goal 20 Validation Report

Goal: Auth Workspace-Scoped Admin Isolation.

Implementation summary:

- AdminAuthGuard now normalizes optional Auth workspace/tenant claims and accepted Auth app role strings into request.adminUser scope keys.
- AdminLeadsController passes request.adminUser into admin service methods and logs only safe scope metadata.
- LeadsService applies Vault-backed LEADS_ADMIN_WORKSPACE_SOURCE_MAP to admin summary, list, and detail reads.
- global:superadmin remains platform-wide.
- Non-global admin reads fail closed when Auth workspace/tenant/role scope or configured source mapping is missing.
- k8s/external-secret.yaml maps LEADS_ADMIN_WORKSPACE_SOURCE_MAP from Vault; k8s/configmap.yaml no longer carries the runtime map.

Validation evidence completed before this report:

- Focused tests passed: src/auth/admin-auth.guard.spec.ts, src/leads/admin-leads.controller.spec.ts, src/leads/leads.service.spec.ts; 3 suites, 20 tests.
- npm run build: passed.
- npm run lint: passed.
- npm test: passed, 12 suites, 69 tests.

Sensitive-data handling:

- Tests use synthetic ids, roles, source services, and workspace ids only.
- No Auth bearer token value, real contact detail, raw production lead row, raw message, confirmation token, private URL path/query value, raw consent source value, or secret is recorded.

Contract impact:

- Admin list/detail/summary reads are now scoped for non-global admins using Auth workspace claim plus LEADS_ADMIN_WORKSPACE_SOURCE_MAP.
- global:superadmin behavior remains platform-wide.
- Internal service routes and public intake routes are unchanged.

Deployment evidence:

- scripts/deploy.sh completed and pushed image localhost:5000/leads-microservice:3cfd822.
- Deployment image was pinned to localhost:5000/leads-microservice:3cfd822 after mutable latest pull latency.
- Rollout status completed successfully after the explicit image tag pod became ready.
- Running pod: leads-microservice-ffbd96ffc-rvk4f, image digest sha256:16a4d225ecaf82d6152697b4e1ad8ed8b03e6a2bbcb2f53ea8766888d5b0c1cc.
- Public health returned status ok.
- GET /api/admin/leads without Authorization returned HTTP 401.
- New pod logs show Prisma migrations complete with no pending migrations and admin routes mapped.

Gate decision: integration and deployment readiness accepted for Goal 20.



Follow-up deployment validation on 2026-06-13:

- Added Auth app role scope keys for existing ecosystem role patterns.
- Moved LEADS_ADMIN_WORKSPACE_SOURCE_MAP to Vault-backed ExternalSecret.
- Patched Vault secret/prod/leads-microservice without printing values; metadata reported version 10.
- Focused tests passed: 2 suites, 20 tests.
- npm run build, npm run lint, and npm test passed; full test suite: 12 suites, 71 tests.
