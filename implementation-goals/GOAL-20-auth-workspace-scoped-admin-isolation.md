# Goal 20 - Auth Workspace-Scoped Admin Isolation

Status: complete pending deployment.

Intent: Leads admin reads must no longer be unscoped for non-global Auth admins. Leads will preserve Auth as the identity/RBAC authority and use an explicit Leads-owned source-service mapping to constrain admin summary, list, and detail reads by active Auth workspace/tenant claim.

Selected mapping decision: use Goal 11 option 2, mapping Auth workspace/tenant IDs to allowed Leads sourceService values through non-sensitive runtime config LEADS_ADMIN_WORKSPACE_SOURCE_MAP. This avoids inventing Auth database tenancy or adding a Lead tenant column before Auth exposes a formal workspace model.

Non-goals:

- No Auth runtime or JWT payload changes.
- No local login, password, registration, or Auth ownership changes.
- No raw lead export, contact reveal, campaign execution, or production lead mutation.
- No Prisma schema migration.

Acceptance criteria:

- AdminAuthGuard normalizes active workspace/tenant claims when Auth returns them.
- global:superadmin remains platform-wide.
- Non-global Leads admins require an Auth workspace/tenant claim and a configured sourceService mapping.
- Admin summary, list, and detail reads apply the same scope.
- Hidden detail reads return the existing not-found behavior rather than revealing cross-scope existence.
- Tests prove scope propagation, sourceService filters, missing workspace rejection, and minimized responses.

