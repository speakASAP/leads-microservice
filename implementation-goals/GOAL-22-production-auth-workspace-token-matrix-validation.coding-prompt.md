# Goal 22 Coding Prompt

Validate Goal 20 production admin isolation without changing source, schema, runtime config, deployment, or production lead state.

Rules:

- Work remote-first on `alfares` in `/home/ssf/Documents/Github/leads-microservice`.
- Do not deploy.
- Do not mutate production data.
- Do not print or persist Auth tokens, secrets, user identifiers, production lead rows, raw contact values, raw messages, confirmation tokens, private URLs, metadata values, or raw consent source values.
- Record only token presence, role/scope class, endpoint HTTP status, aggregate counts when already part of masked summary shape, and response key shapes.
- Stop and record a blocker if a positive validation path requires minting a token, logging into Auth, choosing a production lead id, or using an unapproved workspace token.

Expected validation:

- Health returns HTTP 200.
- Admin list and summary reject missing or invalid bearer credentials with HTTP 401.
- Global admin list/summary reads are validated only with a currently valid approved token path.
- Non-global admin source scoping is validated only with owner-provided workspace/app-scoped tokens or approved synthetic staging tokens.
