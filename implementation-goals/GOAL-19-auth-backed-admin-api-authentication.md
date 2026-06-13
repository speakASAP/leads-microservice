# Goal 19 - Auth-Backed Admin API Authentication

## Intent

Leads must replace browser-entered internal service token usage with Auth-backed bearer-token validation for human admin APIs, while keeping service-to-service internal token routes separate.

## Scope

- Validate Auth-issued bearer tokens by calling Auth POST /auth/validate.
- Enforce Leads admin roles locally from Auth-owned role claims.
- Add masked browser/admin APIs under /api/admin/leads.
- Update the admin browser shell to send Authorization bearer tokens instead of x-internal-service-token.

## Non-Goals

- No local JWT signing or Auth ownership changes.
- No password, OAuth, magic-link, refresh-token, or role assignment implementation in Leads.
- No raw lead export, campaign execution, notification dispatch, CRM workflow, AI export, or production data mutation.
- No tenant/workspace scoping until Auth tenant mapping semantics are confirmed.

## Acceptance Criteria

- Browser/admin APIs require Auth bearer tokens and accepted Leads roles.
- Internal service routes continue to use InternalServiceGuard only.
- Admin list/detail responses are masked/minimized by default.
- Token values and decoded sensitive profile fields are not logged.
- Tests cover missing token, Auth rejection, role rejection, accepted role, masked admin responses, and unchanged internal route guards.
