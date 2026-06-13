# Goal 20 Context Package

DocsRAG retrieval was queried from the in-cluster Leads pod using runtime JWT_TOKEN and returned HTTP 200. The returned context reinforced Auth as the JWT/RBAC source of truth but did not provide a concrete Auth workspace schema or claim contract.

Auth source of truth reviewed:

- auth-microservice/docs/UNIFIED_AUTH_CONTRACT.md: POST /auth/validate returns valid true and a user object; JWT payload includes sub, email, type, roles, auth_method, iat, exp.
- auth-microservice/docs/CONSUMER_JWT_VALIDATION_STANDARD.md: default consumer pattern is server-side POST /auth/validate; consumers may enforce endpoint authorization locally but must not mint Auth JWTs or change Auth role semantics.
- auth-microservice roles source: role strings are global/app/internal. No workspace or tenant entity was found in the inspected Auth runtime source.

Leads source of truth reviewed:

- Goal 11.3 requires all future admin APIs to be tenant scoped, but blocks schema changes until mapping is selected.
- Goal 11.3 lists three options. Goal 20 selects option 2: sourceService-to-workspace mapping.
- Goal 19 already added Auth-backed masked admin APIs and recorded tenant scoping as follow-up.

Selected implementation:

- Extract optional activeWorkspaceId/workspaceId/activeTenantId/tenantId and workspaceIds/tenantIds from Auth validate response.
- Treat global:superadmin as platform-wide.
- For non-global admins, require workspaceId and LEADS_ADMIN_WORKSPACE_SOURCE_MAP entry.
- Apply sourceService filters to admin summary, list, and detail reads.
- Keep admin responses minimized and unchanged in sensitive field omission.

