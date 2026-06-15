# Goal 22 - Production Auth Workspace Token Matrix Validation

Status: partially validated; blocked for positive approved-token reads.

Intent: Validate deployed Goal 20 admin isolation behavior with real or owner-approved synthetic Auth tokens without printing tokens, raw lead data, production lead rows, raw contact values, raw messages, confirmation tokens, private URLs, metadata values, or raw consent source values.

Scope:

- Production health and admin rejection smoke checks.
- Real-token validation only when an already-issued or owner-approved token path is available without printing token material.
- Evidence records token presence, role/scope class, endpoint status, and minimized response shape only.

Non-goals:

- No source change, schema change, deployment, raw lead export, outreach, AI/CRM export, or production mutation.
- No Auth login using stored credentials, because that can mutate production Auth login/session/audit state.
- No production lead row, contact value, message, confirmation token, metadata value, private URL, or raw consent source capture.

Result summary:

- Health check passed with HTTP 200.
- Unauthenticated and invalid-token admin rejection passed with HTTP 401 for list and summary endpoints.
- Existing Kubernetes token candidates were present but Auth rejected them with HTTP 401, so no positive global admin read was performed.
- Non-global workspace admin validation remains blocked pending owner-provided workspace admin tokens or approved synthetic staging tokens.

Next requirement:

- Provide a currently valid global admin token and at least one non-global workspace/app-scoped admin token, or approve a non-production/synthetic token path, with exact allowed validation endpoints and no production mutation.
