# Goal 22 Coding Prompt

Validate Goal 20 production admin isolation without changing Leads source, schema, runtime config, deployment, or production lead state.

Rules:

- Work remote-first on `alfares` in `/home/ssf/Documents/Github/leads-microservice`.
- Do not deploy.
- Do not mutate production Leads data.
- Do not print or persist Auth tokens, secrets, user identifiers, production lead rows, raw contact values, raw messages, confirmation tokens, private URLs, metadata values, or raw consent source values.
- Record only token presence/class, role/scope class, endpoint HTTP status, aggregate counts when already part of masked summary/list shape, and response key shapes.
- Owner approval on 2026-06-15 permits creating or locating approved Auth admin tokens for this validation, provided token values/secrets are never printed or persisted.
- Synthetic Auth validation users may be created only for the smoke and must be removed after validation.

Expected validation:

- Health returns HTTP 200.
- Admin list and summary reject missing or invalid bearer credentials with HTTP 401.
- Global admin list/summary reads pass with a valid Auth global admin token and masked evidence only.
- Non-global admin source scoping passes with a valid Auth app/workspace-scoped admin token and masked evidence only.
- Out-of-scope non-global source filtering returns an empty masked result without revealing hidden rows.
