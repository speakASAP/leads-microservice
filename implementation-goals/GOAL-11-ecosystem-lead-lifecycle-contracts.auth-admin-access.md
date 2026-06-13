# Goal 11 Contracts - Auth-Backed Tenant And Admin Access

```yaml
id: LEADS-GOAL-11-AUTH-ADMIN-ACCESS
status: approved
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.contracts.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - future source execution plans
```

## Purpose

Define the Auth-backed tenant and admin access requirements for the Leads admin experience before replacing the temporary browser-entered internal service token shell.

This is a contract artifact only. It does not change runtime authentication behavior.

## Source Context

DocsRAG retrieval for Auth/RBAC context returned HTTP 200 from the in-cluster Leads runtime pod. The retrieved ecosystem context reinforced:

- centralized user management belongs in `auth-microservice`;
- JWT tokens should include user roles;
- authorization middleware should work across services;
- admins can assign roles to users;
- user-facing apps use role-based access;
- Auth owns login, registration, redirects, OAuth, magic-link, RBAC, and unified auth contracts.

Token values were not printed.

## Core Decision

Human admin access to Leads must use Auth-backed sessions or JWTs. Browser users must not type or store `INTERNAL_SERVICE_TOKEN`.

Service-to-service calls may continue to use `InternalServiceGuard` with `x-internal-service-token` and `x-service-name`, but that path is for trusted backend services only, not browser admin users.

## Ownership Boundary

| Capability | Owner |
| --- | --- |
| Login, registration, session issuance, OAuth, magic links | `auth-microservice` |
| JWT validation contract, issuer, audience, roles, user identity | `auth-microservice` |
| Organizations/workspaces/tenants and membership | `auth-microservice` |
| Leads admin authorization decisions based on Auth claims | `leads-microservice` |
| Non-registered lead data and consent evidence | `leads-microservice` |
| Service-to-service trust token handling | Existing Leads internal guard until replaced or supplemented |
| Contact reveal audit and lead admin action audit | Leads plus logging-microservice metadata |

Leads must not implement its own login UI, password handling, identity database, user registration, or RBAC source of truth.

## Required Auth Claims

The exact Auth claim names must be confirmed against `auth-microservice/docs/UNIFIED_AUTH_CONTRACT.md` before source implementation. Leads requires equivalent semantics:

```json
{
  "sub": "auth-user-id",
  "iss": "auth-microservice",
  "aud": "leads-microservice",
  "exp": 1781330000,
  "roles": ["leads.admin"],
  "workspaceIds": ["workspace-id"],
  "activeWorkspaceId": "workspace-id"
}
```

Required semantics:

- stable user identifier;
- issuer and audience validation;
- expiry validation;
- role list or permission list;
- active workspace/tenant identifier;
- membership proof for the active workspace.

Do not log full JWTs, refresh tokens, session cookies, or decoded sensitive profile values.

## Leads Roles

Initial Leads roles:

- `leads.owner`
- `leads.admin`
- `leads.sales_operator`
- `leads.marketing_operator`
- `leads.viewer`

Role meanings:

| Role | Intent |
| --- | --- |
| `leads.owner` | Tenant-level owner; can manage Leads admin settings and high-risk reveal/export approvals when implemented. |
| `leads.admin` | Can manage lead lifecycle workflow and operator access within the tenant. |
| `leads.sales_operator` | Can review leads, update lifecycle statuses, add follow-up notes in CRM once CRM exists, and request contact reveal for one lead. |
| `leads.marketing_operator` | Can review campaign eligibility and request campaign membership approval; cannot execute campaign sends from Leads. |
| `leads.viewer` | Read-only masked operational visibility. |

Global platform superuser behavior, if supported by Auth, must be explicitly mapped and audited before implementation.

## Permission Matrix

| Action | owner | admin | sales_operator | marketing_operator | viewer |
| --- | --- | --- | --- | --- | --- |
| View masked lead list | yes | yes | yes | yes | yes |
| View masked lead detail | yes | yes | yes | yes | yes |
| View consent/preference state | yes | yes | yes | yes | yes |
| Update lead lifecycle status | yes | yes | yes | no | no |
| Request one-lead contact reveal | yes | yes | yes | no | no |
| Approve contact reveal | yes | yes | no | no | no |
| View campaign eligibility preview | yes | yes | no | yes | yes |
| Approve campaign membership handoff | yes | yes | no | yes | no |
| Export raw leads | no by default | no by default | no | no | no |
| Trigger campaign send | no | no | no | no | no |
| Manage tenant settings | yes | yes | no | no | no |

Raw lead export remains disabled by default for all roles. Any future export requires owner approval, exact fields, destination, retention, and validation evidence.

## Tenant Scoping

All admin views and future admin APIs must be scoped by the active Auth workspace/tenant.

Implementation-critical open question:

- The exact Auth workspace/tenant model and claim names must be confirmed before source edits.

Leads runtime schema changes are blocked until the tenant mapping is selected. Likely future options:

1. Add `workspaceId` or `tenantId` directly to `Lead`.
2. Map `sourceService` and source application registrations to tenant ownership.
3. Maintain a separate `LeadTenantAssignment` table when one lead can belong to a tenant after review.

Default stance:

- no cross-tenant list/detail reads;
- no unscoped admin lead retrieval;
- no tenant scope inferred from source URL alone;
- no production migration until contract and migration plan are approved.

## Browser Admin Access Flow

Target flow:

1. User opens `/admin`.
2. If not authenticated, frontend redirects to Auth login or begins the Auth-managed login flow.
3. Auth issues a session/JWT for `leads-microservice` audience.
4. Leads frontend calls admin APIs with Auth session/JWT.
5. Leads backend validates issuer, audience, expiry, roles, and active workspace.
6. Leads backend returns masked, tenant-scoped data by default.
7. Contact reveal or approval actions require stronger permission and audit metadata.

The current internal-token input in the admin shell is temporary and must be removed only after Auth-backed admin APIs are ready.

## API Boundary

Future human admin APIs should be separate from trusted service APIs.

Recommended browser/admin namespace:

```http
GET /api/admin/leads/summary
GET /api/admin/leads
GET /api/admin/leads/:id
POST /api/admin/leads/:id/contact-reveal-requests
POST /api/admin/leads/:id/contact-reveals/:requestId/approve
PATCH /api/admin/leads/:id/lifecycle
```

Rules:

- Browser/admin APIs require Auth session/JWT, not `x-internal-service-token`.
- Service-to-service APIs may continue under `/api/leads/internal/...` with `InternalServiceGuard`.
- Mask contact values by default.
- Do not return raw messages in list views.
- Do not return confirmation tokens.
- Do not expose private source URL path/query values.
- Preserve the max list bound of 30 unless owner approves a separate operational change.

## Contact Reveal Contract

Contact reveal is high-risk and must be one-lead-at-a-time until a future approved batch process exists.

Reveal request fields:

```json
{
  "purpose": "manual_follow_up",
  "channel": "email",
  "reason": "operator-reviewed qualified lead"
}
```

Reveal approval fields:

```json
{
  "requestId": "uuid",
  "approvalDecision": "approved",
  "approvedBy": "auth-user-id"
}
```

Audit metadata:

- actor user ID;
- active workspace ID;
- lead ID;
- action;
- purpose;
- channel;
- approval ID;
- timestamp;
- result status.

Audit logs must not include the revealed contact value.

## Logging And Privacy

Allowed in logs:

- lead ID;
- actor user ID;
- workspace ID;
- action name;
- role;
- purpose;
- counts;
- timestamps;
- success/failure status.

Forbidden in logs:

- full JWTs;
- refresh tokens;
- session cookies;
- contact values;
- raw messages;
- confirmation tokens;
- private source URLs;
- metadata values.

## Error Behavior

Recommended API responses:

- `401`: missing, expired, invalid, or wrong-audience Auth token.
- `403`: valid identity but missing role, permission, or workspace membership.
- `404`: tenant-scoped resource not visible to the caller.
- `409`: lifecycle update conflict or already-processed approval.
- `422`: invalid purpose, channel, or approval payload.

Avoid returning whether a hidden lead exists across tenant boundaries.

## Implementation Order

1. Confirm Auth contract and exact JWT/workspace/role claim names from `auth-microservice`.
2. Add Goal 11 source execution plan for Auth-backed admin access.
3. Add Auth admin guard or middleware in Leads.
4. Add synthetic guard/unit tests for roles and tenant scope.
5. Add masked `/api/admin/leads` endpoints.
6. Add frontend Auth login/redirect integration.
7. Remove browser-entered internal-token access only after Auth-backed admin flow works.
8. Add contact reveal request/approval only after audit semantics are implemented.

## Non-Goals

- No runtime code change in this contract chunk.
- No Auth database or login UI in Leads.
- No raw lead export.
- No mass outreach.
- No campaign send execution.
- No production lead read or mutation validation.
- No token values in docs, logs, tests, prompts, or validation output.
