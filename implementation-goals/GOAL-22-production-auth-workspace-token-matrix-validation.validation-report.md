# Goal 22 Validation Report

Goal: Production Auth Workspace Token Matrix Validation.

Status: complete.

Pre-coding gate result: pass with owner-approved synthetic Auth validation path.

Validation evidence:

- DocsRAG query from the in-cluster Leads runtime pod returned HTTP 500 on 2026-06-15. The runtime token value was not printed or persisted.
- Earlier negative-path production validation remained valid: health HTTP 200; missing bearer admin list HTTP 401; invalid placeholder bearer admin list HTTP 401; invalid placeholder bearer admin summary HTTP 401.
- Live Leads scope map was checked as metadata only: the map was present and parseable; role/scope keys and source counts were recorded without printing the Vault value.
- Owner approved creating or locating validation tokens without printing or persisting token values.
- A one-off masked smoke ran inside the Auth pod using Auth runtime/database DNS. It created two synthetic Auth validation users, assigned one global role class and one non-global app admin role class, logged in through live Auth, called live Auth validation, called deployed Leads admin APIs, and removed both synthetic users after validation.
- Auth validation returned success for both token classes: global token class had role class `global:superadmin`; scoped token class had role class `app:*:admin`. Auth POST validation returned HTTP 201 with `valid: true` for both, which is the deployed Nest POST success status.
- `GET https://leads.alfares.cz/health`: HTTP 200.
- Global admin `GET /api/admin/leads/summary`: HTTP 200; response keys `confirmed`, `consented`, `total`, `unsubscribed`; aggregate counts total 33, confirmed 4, consented 0, unsubscribed 0.
- Global admin `GET /api/admin/leads?limit=1`: HTTP 200; response keys `items`, `limit`, `page`, `total`; aggregate total 33, page 1, limit 1, itemCount 1; first item key shape only was recorded.
- Non-global scoped admin `GET /api/admin/leads/summary`: HTTP 200; response keys `confirmed`, `consented`, `total`, `unsubscribed`; aggregate counts total 3, confirmed 0, consented 0, unsubscribed 0.
- Non-global scoped admin `GET /api/admin/leads?limit=1`: HTTP 200; response keys `items`, `limit`, `page`, `total`; aggregate total 3, page 1, limit 1, itemCount 1; first item key shape only was recorded.
- Non-global scoped admin out-of-scope source filter `GET /api/admin/leads?sourceService=<class>&limit=1`: HTTP 200; response keys `items`, `limit`, `page`, `total`; aggregate total 0, page 1, limit 1, itemCount 0.
- Cleanup evidence: 2 synthetic Auth validation users removed after the smoke.

Masked response shape evidence:

- Rejection paths recorded HTTP status only.
- Positive paths recorded role/scope class, HTTP status, top-level response keys, aggregate counts, and first-item key names only.
- No bearer token, JWT payload, password, email value, user id value, production lead row value, contact value, raw message, confirmation token, private URL, metadata value, or raw consent source value was printed or persisted.
- No detail endpoint was exercised because selecting a production lead id was not required to validate the token matrix and would increase row-specific exposure risk.

Sensitive-data handling:

- Tokens and generated passwords stayed in process memory only.
- Synthetic Auth user identifiers were not printed or persisted in docs.
- Synthetic Auth users were removed after validation.
- No Leads production data was mutated.

Contract/schema impact:

- No Leads source, schema, public API, admin API, Auth API, internal-service API, deployment, or runtime config change.
- Auth ownership of identity/RBAC and Leads ownership of source-scoped masked admin reads were preserved.

Consent/outreach/AI/CRM impact:

- No consent semantics change.
- No unsubscribe or confirmation behavior change.
- No outreach, campaign execution, raw lead export, AI export, or CRM export.

Decision:

- Negative-path production validation accepted.
- Positive global admin production validation passed with masked evidence.
- Positive non-global scoped admin production validation passed with masked evidence, including an out-of-scope empty result check.
- Goal 22 is complete.
