# Leads Admin Hosted Auth Plan

Date: 2026-06-24
Owner role: Leads admin hosted-auth worker
Repository: `/home/ssf/Documents/Github/leads-microservice`
Mode: remote-only bounded implementation

## IPS Chain

Vision: Alfares services use centralized hosted Auth for human sign-in while product services keep their own domain data boundaries.

Goal Impact: Leads public intake stays no-login for lead submitters, while admin users enter through `https://auth.alfares.cz/login` and return with Auth-owned session material instead of copying bearer tokens into the UI.

System: `auth-microservice` hosted login and `/auth/validate`; Leads public static intake and admin static shell; Leads admin APIs protected by `src/auth/admin-auth.guard.ts`.

Feature: hosted Auth redirect and session adapter for the Leads admin shell.

Task: verify the public no-login boundary, document current auth surfaces, replace manual admin token paste UX only if still present, and preserve backend `/auth/validate` behavior.

Execution Plan: inspect required Auth standard docs; statically scan `public/**`, `src/auth/**`, and repo docs/tests; change only `public/**`, targeted tests, and this repo-local plan; do not read secrets, live DB data, lead exports, confirmation tokens, lifecycle payloads, deployment files, or Kubernetes resources.

Coding Prompt: keep public lead intake unauthenticated, remove visible manual bearer-token paste from the admin browser shell, use hosted Auth `client_id=leads-microservice`, validate returned `state`, strip URL fragments, store only the transitional browser session needed to call existing admin APIs, and do not change backend bearer validation.

Code: `public/admin.html`, `public/admin.js`, `public/auth/callback.html`, `public/admin.spec.ts`, and this plan.

Validation: targeted static UI tests, admin guard tests, full repo test/build when available without secrets, static token-paste scan, and `git diff --check` on changed files.

## Current Auth Surface

- Public intake: `public/index.html` and lead submission endpoints remain public/no-registration. `src/leads/leads.controller.spec.ts` records that public intake and confirmation do not require internal credentials.
- Admin API: `src/auth/admin-auth.guard.ts` extracts `Authorization: Bearer ...`, calls `AUTH_SERVICE_URL` `/auth/validate`, accepts Leads/admin role claims, and rejects missing or invalid bearer tokens.
- Admin browser shell before this lane: `public/admin.html` exposed a password input for an Auth access token; `public/admin.js` stored `leadsAdminAuthToken` in `sessionStorage` and sent `Authorization: Bearer` headers.
- Hosted Auth consumer standard: Auth owns human credential collection and returns token fragments to a consumer callback. Consumers must validate state and strip fragments.

## Public No-Login Boundary

The lead submitter path must not be routed through hosted Auth. This lane does not change `public/index.html`, public lead controllers, lead DTOs, confirmation routes, lifecycle payloads, database schema, migrations, or deploy/k8s files.

## Admin Hosted-Auth State

Implemented as a bounded transitional frontend adapter:

- `public/admin.html` now shows hosted Auth sign-in/sign-out controls instead of a token input.
- `public/admin.js` builds `https://auth.alfares.cz/login` with `client_id=leads-microservice`, `return_url=<origin>/auth/callback.html`, and generated `state`.
- `public/auth/callback.html` bridges the static callback back to `/admin` with the Auth fragment intact.
- `public/admin.js` validates returned `state`, stores the Auth access token in `sessionStorage`, strips the fragment, and keeps calling existing admin APIs with `Authorization: Bearer`.
- Transitional debt: this is not an HTTP-only BFF cookie session. It avoids manual token paste but still stores a short browser-session access token because no Leads BFF session endpoint exists in this bounded file scope.

## Blockers And Unknowns

- `[MISSING: production Auth redirect allowlist confirmation for https://leads.alfares.cz/auth/callback.html]`; no runtime secret/config inspection was performed.
- `[MISSING: safe live admin token or non-production hosted-auth smoke path]`; no live Auth login or admin data smoke was run.
- `[UNKNOWN: whether Auth should register a leads-microservice or shorter leads client id in the final registry]`; this plan uses the repository identifier from the ecosystem handoff.

## Validation Evidence

Commands run on 2026-06-24 in `/home/ssf/Documents/Github/leads-microservice`:

- `npm test -- public/admin.spec.ts src/auth/admin-auth.guard.spec.ts`: passed; 2 suites, 13 tests.
- `npm test`: passed; 16 suites, 100 tests.
- `npm run build`: passed.
- `rg -n "localStorage|admin-auth-form|Auth access token|paste|<input[^>]*(token|password)" public src/auth`: no matches.
- `git diff --check -- public/admin.html public/admin.js public/admin.spec.ts public/auth/callback.html docs/orchestrator/2026-06-24-leads-admin-hosted-auth-plan.md`: passed.
- Static public no-login evidence: `src/leads/leads.controller.spec.ts` keeps the test `does not require internal service credentials for public intake or confirmation`; `src/leads/leads.controller.ts` still exposes public `POST /api/leads/submit` and `GET /api/leads/confirm/:token` routes.

No raw tokens, secrets, production lead rows, contact values, confirmation tokens, private URLs, live DB data, lifecycle payloads, Kubernetes Secret data, or deploy commands were read or recorded.
