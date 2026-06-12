# Leads Orchestrator Status

## 2026-06-12 - Intent Preservation System

Current focus:

- Owner-selected documentation update: add the company Intent Preservation System to `leads-microservice`.
- Runtime code changes: none.
- Deployment: not required.

Source context:

- Reviewed `AGENTS.md`, `README.md`, `BUSINESS.md`, `SYSTEM.md`, `TASKS.md`, `STATE.json`, Prisma schema, lead controller/service, lead DTOs, internal-service guard, notification service, health controller, and main bootstrap behavior.
- Reviewed company-style IPS examples from `ai-microservice`, `warehouse-microservice`, `auth-microservice`, `catalog-microservice`, `backups-microservice`, and `flipflop-service`.
- Attempted DocsRAG retrieval from the remote repo, but `JWT_TOKEN` was not set in the remote shell. This documentation-only task therefore used repo-local source-of-truth docs and recorded the credential limitation.

Implementation evidence:

- Added `docs/orchestrator/MASTER_PROMPT.md`.
- Added `docs/orchestrator/INTENT.md`.
- Added `docs/orchestrator/GOALS.md`.
- Added `docs/orchestrator/PLAN.md`.
- Added `docs/orchestrator/PROJECT_INVARIANTS.md`.
- Added `docs/orchestrator/PRE_CODING_GATE.md`.
- Added `docs/orchestrator/CONTEXT_PACKAGE.md`.
- Added `docs/orchestrator/EXECUTION_PLAN.md`.
- Added `docs/orchestrator/READINESS_GATES.md`.
- Added `docs/orchestrator/PROMPTS.md`.
- Added `docs/orchestrator/STATUS.md`.
- Added `docs/IMPLEMENTATION_ORCHESTRATOR.md`.
- Added `docs/IMPLEMENTATION_STATE.md`.
- Added `implementation-goals/README.md`.
- Added `implementation-goals/GOAL-01-intent-preservation-system.md`.
- Added execution, context, coding prompt, and validation report templates.
- Updated `AGENTS.md` so future work must follow the Leads IPS workflow.
- Updated `TASKS.md` with the completed `intent-preservation-system-applied` milestone.
- Updated `STATE.json` so the next focus points at Goal 2 and the DocsRAG credential limitation is visible.

Validation evidence:

- Documentation presence check passed on `alfares`: `find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print` listed the orchestrator docs, implementation goal record, and four templates.
- Missing-marker scan passed on `alfares` with no matches: `rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`.
- Secret-pattern scan passed on `alfares` with no matches for bearer-token or secret-assignment patterns across `docs`, `AGENTS.md`, `TASKS.md`, and `implementation-goals`.
- Remote `git status --short --branch` showed this documentation pack as uncommitted changes on `main`; the branch was already ahead of `origin/main` by one commit before this pack was committed or pushed.

Gate decision:

- Documentation-only readiness accepted. Runtime validation and deployment are not required because no source, schema, secret, or deployment files changed.

Next unfinished chunks:

- Goal 2 - Lead Intake Contract And Consent Hardening is the default next implementation goal.

## 2026-06-12 - Goal 2 Chunk 2.1 Lead Intake Validation

Current focus:

- Selected default next goal: Goal 2 - Lead Intake Contract And Consent Hardening.
- Completed chunk: 2.1 Review `POST /api/leads/submit` request validation and contact method constraints.
- Runtime code changes: DTO validation and focused DTO tests only.
- Deployment: not requested and not performed.

Source context:

- Reviewed `BUSINESS.md`, `SYSTEM.md`, `AGENTS.md`, `TASKS.md`, `STATE.json`, implementation state, orchestrator docs, and Goal 2 artifacts.
- Attempted DocsRAG retrieval from the remote repo, but `JWT_TOKEN` was not set in the remote shell. Used repo-local source-of-truth docs.
- Reviewed `src/leads/dto/create-lead.dto.ts`, `src/leads/dto/create-lead.dto.spec.ts`, `src/leads/leads.controller.ts`, `src/leads/leads.service.ts`, `src/notifications/notifications.service.ts`, `prisma/schema.prisma`, and `package.json`.

Implementation evidence:

- Added Goal 2 execution, context, coding prompt, and validation report artifacts under `implementation-goals/`.
- Updated `LeadContactMethodDto.type` to accept only `email`, `telegram`, or `whatsapp`.
- Added `@ArrayMinSize(1)` to `CreateLeadDto.contactMethods` while preserving the existing max size of 30.
- Expanded `src/leads/dto/create-lead.dto.spec.ts` to cover valid consent timestamp, invalid consent timestamp, empty contact methods, more than 30 contact methods, unsupported method type, and empty method value.

Validation evidence:

- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts`: passed, 6 tests.
- `npm run build`: passed.
- Sensitive-data handling: synthetic test values only; no secrets, real contact details, production lead rows, confirmation tokens, private URLs, or production payloads captured.
- Contract impact: public intake validation is stricter for contact methods. Consumers must send at least one non-empty `email`, `telegram`, or `whatsapp` contact method. Custom method types such as `sms` are now rejected.
- Consent impact: existing consent timestamp validation remains covered. Exact consent evidence requirements remain for chunk 2.2.

Gate decision:

- Integration readiness accepted for chunk 2.1. Deployment readiness not evaluated because deployment was not requested.

Next unfinished chunks:

- Goal 2 chunk 2.2 - Define exact consent evidence requirements for marketing consent, consent source, and captured timestamp.

## 2026-06-12 - Goal 2 Chunk 2.2 Consent Evidence Requirements

Current focus:

- Selected default next chunk: Goal 2 chunk 2.2.
- Completed chunk: define exact consent evidence requirements for marketing consent, consent source, and captured timestamp.
- Runtime code changes: DTO validation and focused DTO tests only.
- Deployment: not requested and not performed.

Source context:

- Reviewed `BUSINESS.md`, `SYSTEM.md`, `AGENTS.md`, `TASKS.md`, `STATE.json`, implementation state, orchestrator docs, and Goal 2 artifacts.
- Checked DocsRAG credential availability on `alfares`; `JWT_TOKEN` was not set, so retrieval was unavailable and repo-local source-of-truth docs were used.
- Reviewed `src/leads/dto/create-lead.dto.ts`, `src/leads/dto/create-lead.dto.spec.ts`, `src/leads/leads.service.ts`, `prisma/schema.prisma`, and `package.json`.

Implementation evidence:

- Updated Goal 2 execution, context, coding prompt, and validation report artifacts for chunk 2.2 before source edits.
- Ran the pre-coding gate with `pass-with-documented-risk` because DocsRAG credentials were unavailable but local source-of-truth docs were sufficient for the narrow chunk.
- Added conditional DTO validation so `marketingConsent: true` requires non-empty `consentSource` and valid ISO8601 `consentCapturedAt`.
- Preserved compatibility for missing or `false` `marketingConsent` as no affirmative marketing opt-in.
- Expanded focused DTO tests to cover affirmative consent evidence, missing source, empty source, missing timestamp, and no-opt-in compatibility.

Validation evidence:

- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts`: passed, 12 tests.
- `npm run build`: passed.
- Missing-marker scan passed with no matches: `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`.
- Secret-pattern scan passed with no matches across `docs`, `AGENTS.md`, `TASKS.md`, `implementation-goals`, and `src/leads/dto/create-lead.dto.spec.ts`.
- Sensitive-data handling: synthetic test values only; no secrets, real contact details, production lead rows, confirmation tokens, private URLs, or production payloads captured.
- Contract impact: public intake validation is stricter only for affirmative marketing opt-in. Consumers sending `marketingConsent: true` must include `consentSource` and `consentCapturedAt`. Consumers omitting marketing consent or sending `marketingConsent: false` remain compatible.
- Consent impact: affirmative marketing consent now has explicit source and captured timestamp evidence requirements.

Gate decision:

- Integration readiness accepted for chunk 2.2. Deployment readiness not evaluated because deployment was not requested.

Next unfinished chunks:

- Goal 2 chunk 2.3 - Add or tighten tests for invalid contact methods, oversized arrays, invalid timestamps, and missing consent context where required.

## 2026-06-12 - DocsRAG JWT Runtime Wiring Fixed

Current focus:

- Owner-selected operational fix: make DocsRAG usable for Leads after prior attempts recorded missing JWT_TOKEN on alfares.
- Runtime code changes: none.
- Deployment action: restarted deployment/leads-microservice so the pod picked up the already-synced Kubernetes secret.

Source context:

- Compared the AI microservice and RunLayer fixes. Both add JWT_TOKEN to .env.example and map Vault JWT_TOKEN through k8s/external-secret.yaml.
- Confirmed Leads already has the same repository wiring: .env.example contains JWT_TOKEN=, and k8s/external-secret.yaml maps secret/prod/leads-microservice property JWT_TOKEN into leads-microservice-secret.
- Confirmed the live Kubernetes secret includes JWT_TOKEN, but the old pod was started before the secret key was available, so its process environment did not include the token.

Validation evidence:

- Before restart, the Leads deployment reported JWT_TOKEN_MISSING from its runtime environment.
- kubectl -n statex-apps rollout restart deployment/leads-microservice and kubectl -n statex-apps rollout status deployment/leads-microservice --timeout=180s completed successfully.
- After restart, the Leads deployment reported JWT_TOKEN_PRESENT from its runtime environment.
- External health passed: curl -sS https://leads.alfares.cz/health returned {"status":"ok"}.
- DocsRAG retrieval passed from inside the Leads pod using Node fetch because the runtime image does not include curl: POST http://docs-rag-microservice:3397/retrieval/agent-context returned HTTP 200 for query Leads microservice consent-aware intake operational constraints.
- Sensitive-data handling: the token value was never printed or copied; only presence and HTTP status were recorded.

Gate decision:

- DocsRAG credential blocker resolved for the Leads runtime pod. Future RAG queries should run from an in-cluster client with the runtime environment; the plain SSH shell on alfares is not expected to expose runtime secrets.

Next unfinished chunks:

- Goal 2 chunk 2.3 - Add or tighten tests for invalid contact methods, oversized arrays, invalid timestamps, and missing consent context where required.

## 2026-06-12 - Goal 2 Chunk 2.3 Focused Validation Coverage

Current focus:

- Selected default next chunk: Goal 2 chunk 2.3.
- Completed chunk: add or tighten tests for invalid contact methods, oversized arrays, invalid timestamps, and missing consent context where required.
- Runtime code changes: none for this chunk; existing focused DTO tests already cover the required cases.
- Deployment: not requested and not performed.

Source context:

- Reviewed `docs/IMPLEMENTATION_STATE.md`, `docs/orchestrator/STATUS.md`, required orchestrator docs, Goal 2 artifacts, and `src/leads/dto/create-lead.dto.spec.ts`.
- Queried DocsRAG from inside the Leads runtime pod because the plain SSH shell does not expose runtime secrets. Retrieval returned HTTP 200 for the chunk 2.3 validation-coverage query. The token value was not printed or persisted.
- DocsRAG context reinforced DTO validation, max-30 request-size limits, ISO timestamp validation, and consent/unsubscribe decision coverage.

Implementation evidence:

- Updated Goal 2 execution, context, coding prompt, and validation report artifacts for chunk 2.3 before source edits.
- Ran the pre-coding gate with `pass`.
- Confirmed no source edit was needed because the focused DTO suite already covers invalid contact method type/value, oversized contact method arrays, invalid consent timestamps, and missing affirmative-consent source/timestamp.

Validation evidence:

- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts`: passed, 12 tests.
- `npm run build`: passed.
- Missing-marker scan passed with no matches: `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`.
- Secret-pattern scan passed with no matches across `docs`, `AGENTS.md`, `TASKS.md`, `implementation-goals`, and `src/leads/dto/create-lead.dto.spec.ts`.
- Sensitive-data handling: synthetic test values only; no secrets, real contact details, production lead rows, confirmation tokens, private URLs, or production payloads captured.
- Contract impact: no new public contract change; this chunk verifies existing DTO validation coverage for `POST /api/leads/submit`.
- Consent impact: no semantics change; test coverage confirms invalid timestamp and missing required affirmative-consent evidence are rejected.

Gate decision:

- Integration readiness accepted for chunk 2.3. Deployment readiness not evaluated because deployment was not requested.

Next unfinished chunks:

- Goal 2 chunk 2.4 - Record consumer compatibility risks for sgiprealestate, statex, and marketing-microservice.

## 2026-06-12 - Goal 2 Chunk 2.4 Consumer Compatibility Risks

Current focus:

- Selected default next chunk: Goal 2 chunk 2.4.
- Completed chunk: record consumer compatibility risks for sgiprealestate, statex, and marketing-microservice.
- Runtime code changes: none; documentation-only compatibility risk register.
- Deployment: not requested and not performed.

Source context:

- Reviewed `docs/IMPLEMENTATION_STATE.md`, `docs/orchestrator/STATUS.md`, required orchestrator docs, Goal 2 artifacts, `BUSINESS.md`, `SYSTEM.md`, `TASKS.md`, `STATE.json`, `src/leads/dto/create-lead.dto.ts`, `src/leads/leads.controller.ts`, and `src/leads/leads.service.ts`.
- Queried DocsRAG from inside the Leads runtime pod because the plain SSH shell does not expose runtime secrets. Retrieval returned HTTP 200 for the chunk 2.4 consumer-compatibility query. The token value was not printed or persisted.
- DocsRAG context confirmed `BUSINESS.md` consumers and reinforced that marketing-microservice reads Leads contact/preference/consent fields for non-registered contacts and must only target leads with explicit marketing consent.
- Noted documentation gap: `README.md` references `docs/EXTERNAL_INTEGRATION.md`, but the file is absent in the current repository.

Implementation evidence:

- Updated Goal 2 execution, context, coding prompt, and validation report artifacts for chunk 2.4 before compatibility documentation.
- Ran the pre-coding gate with `pass`.
- Added a consumer compatibility risk register to `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.md`.
- Recorded compatibility status and migration notes for `sgiprealestate`, `statex`, and `marketing-microservice`.
- Marked Goal 2 complete and updated continuation state toward Goal 3.

Validation evidence:

- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts`: passed, 12 tests.
- `npm run build`: passed.
- Missing-marker scan passed with no matches: `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`.
- Secret-pattern scan passed with no matches across `docs`, `AGENTS.md`, `TASKS.md`, `implementation-goals`, and `src/leads/dto/create-lead.dto.spec.ts`.
- Sensitive-data handling: no data-bearing examples; no secrets, real contact details, production lead rows, confirmation tokens, private URLs, or production payloads captured.
- Contract impact: no new public contract or schema change. Existing risk notes document that consumers must send 1 to 30 `email`, `telegram`, or `whatsapp` contact methods and must include `consentSource` plus ISO8601 `consentCapturedAt` when `marketingConsent` is `true`.
- Consent impact: no semantics change. Missing or `false` marketing consent remains no affirmative opt-in; marketing-microservice must not infer campaign eligibility from contact-method presence or source service alone.

Gate decision:

- Integration readiness accepted for chunk 2.4. Deployment readiness not evaluated because deployment was not requested.

Next unfinished chunks:

- Goal 3 - Privacy-Safe Retrieval And Internal Access.
