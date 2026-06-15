# Goal 22 Validation Report

Goal: Production Auth Workspace Token Matrix Validation.

Status: partially validated; positive approved-token branches blocked.

Pre-coding gate result: pass-with-documented-blockers.

Validation evidence:

- DocsRAG query from the in-cluster Leads runtime pod returned HTTP 500. The runtime token value was not printed or persisted.
- `GET https://leads.alfares.cz/health`: HTTP 200.
- `GET https://leads.alfares.cz/api/admin/leads` without bearer credentials: HTTP 401.
- `GET https://leads.alfares.cz/api/admin/leads` with an invalid placeholder bearer credential: HTTP 401.
- `GET https://leads.alfares.cz/api/admin/leads/summary` with an invalid placeholder bearer credential: HTTP 401.
- Kubernetes existing-token candidate check: `auth:JWT_TOKEN`, `leads:JWT_TOKEN`, `runlayer:JWT_TOKEN`, and `runlayer:ORCHESTRATOR_USER_JWT` were present, but Auth validation returned HTTP 401 for all candidates. No token value was printed or persisted.
- Positive global admin summary/list smoke was not run because no currently accepted non-mutating token candidate was available.
- Non-global workspace source scoping smoke was not run because owner-approved scoped tokens were not available.

Masked response shape evidence:

- Rejection paths recorded HTTP status only.
- The rejected existing-token Leads calls returned only standard error object keys, not lead rows.
- No detail endpoint was exercised because selecting a production lead id would risk exposing production-row context without an approved safe id path.

Sensitive-data handling:

- No token, secret, password, production user identifier, production lead row, raw contact value, raw message, confirmation token, private URL, metadata value, or raw consent source value was printed or persisted.
- No Auth login was performed with stored test credentials because production mutation is forbidden for this task.

Contract/schema impact:

- No source, schema, public API, admin API, Auth API, internal-service API, deployment, or runtime config change.

Consent/outreach/AI/CRM impact:

- No consent semantics change.
- No unsubscribe or confirmation behavior change.
- No outreach, campaign execution, raw lead export, AI export, or CRM export.

Decision:

- Negative-path production validation accepted.
- Goal 22 remains blocked for positive global and non-global reads until the owner provides currently valid approved tokens or approves a synthetic non-production path.

Required handoff:

- Provide a valid global admin token for summary/list shape validation, or approve a non-mutating synthetic token source.
- Provide at least one valid non-global workspace/app-scoped admin token with expected sourceService scope, plus an optional out-of-scope source filter to prove empty/hidden behavior.
