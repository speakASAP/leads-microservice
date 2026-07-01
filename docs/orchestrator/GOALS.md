# Leads Goal Backlog

Status values: `pending`, `active`, `done`, `blocked`.

## Goal 1 - Intent Preservation System

Status: done

Intent: Leads must have a durable local workflow for future development that preserves lead-intake, consent, privacy, and ecosystem ownership boundaries.

Chunks:

- [x] 1.1 Search existing Leads documentation and source context.
- [x] 1.2 Add service-local IPS/orchestrator documentation.
- [x] 1.3 Add implementation-goal templates and continuation state.
- [x] 1.4 Update `AGENTS.md` so future agents follow the IPS gates.
- [x] 1.5 Record documentation-only validation evidence.

Acceptance criteria:

- `docs/orchestrator/` contains intent, goals, plan, prompts, invariants, gates, context, execution, and status docs.
- `docs/IMPLEMENTATION_ORCHESTRATOR.md` and `docs/IMPLEMENTATION_STATE.md` support state-driven continuation.
- `implementation-goals/` contains a goal index, completed IPS goal, and templates for future execution artifacts.
- Future coding is blocked until traceability, invariant review, sensitive-data classification, contract impact, validation plan, and readiness evidence exist.
- No runtime source, schema, secrets, or deployment behavior changes.

## Goal 2 - Lead Intake Contract And Consent Hardening

Status: done

Intent: Public lead submission must remain bounded, validated, consent-aware, and safe for consumer services.

Chunks:

- [x] 2.1 Review `POST /api/leads/submit` request validation and contact campaignId constraints.
- [x] 2.2 Define exact consent evidence requirements for marketing consent, consent source, and captured timestamp.
- [x] 2.3 Add or tighten tests for invalid contact campaignIds, oversized arrays, invalid timestamps, and missing consent context where required.
- [x] 2.4 Record consumer compatibility risks for sgiprealestate, statex, and marketing-microservice.

Acceptance criteria:

- Public intake validation behavior is documented and tested.
- Consent evidence behavior is explicit.
- Existing approved consumers remain compatible or have a migration note.
- `npm run build` and focused tests pass.

## Goal 3 - Privacy-Safe Retrieval And Internal Access

Status: done

Intent: Lead retrieval, list, preference, and unsubscribe APIs must expose only the minimum necessary data through controlled paths.

Chunks:

- [x] 3.1 Audit `GET /api/leads`, `GET /api/leads/:id`, and internal preference endpoints.
- [x] 3.2 Verify or add access controls for non-public lead retrieval.
- [x] 3.3 Preserve the max 30 items per list request.
- [x] 3.4 Add validation evidence for trusted internal-service headers.

Acceptance criteria:

- Raw lead retrieval is not public unless owner-approved and documented.
- Internal preference and unsubscribe APIs require the service guard.
- Pagination and bounds remain enforced.
- No raw production lead data appears in logs, docs, prompts, or tests.

## Goal 4 - Notification And Confirmation Reliability

Status: done

Intent: Lead confirmation requests must remain observable and privacy-safe without making Leads the notification delivery owner.

Chunks:

- [x] 4.1 Review notifications-microservice call contract and error handling.
- [x] 4.2 Verify confirmation token handling does not leak sensitive values in logs or docs.
- [x] 4.3 Add focused tests or smoke evidence for notification failure behavior.
- [x] 4.4 Document notification ownership boundary.

Acceptance criteria:

- Confirmation behavior is reliable and observable.
- Notification failures do not corrupt lead creation state.
- Tokens and raw messages are not leaked in logs or validation reports.
- Notifications remain notifications-microservice-owned.

## Goal 5 - AI And CRM Data-Sharing Boundary

Status: done

Intent: AI and CRM integrations must use minimum necessary lead context and never export raw lead data without explicit owner approval.

Chunks:

- [x] 5.1 Identify current and intended AI/CRM call paths.
- [x] 5.2 Define redaction, minimization, and approval rules.
- [x] 5.3 Add a validation checklist for prompts, logs, and integration payloads.
- [x] 5.4 Split implementation work into owner-approvable chunks.

Acceptance criteria:

- AI/CRM integration data classes are documented.
- Raw lead export requires explicit owner approval in the active task.
- Validation reports include sensitive-data handling evidence.

## Goal 6 - Operational Smoke And Documentation Ingestion

Status: done

Intent: Leads must prove production readiness with health, build, tests, and documentation retrieval evidence.

Chunks:

- [x] 6.1 Run `npm run build` and `npm test`.
- [x] 6.2 Verify `https://leads.alfares.cz/health`.
- [x] 6.3 Trigger DocsRAG ingestion when credentials are available.
- [x] 6.4 Verify retrieval returns the current Leads IPS docs.

Acceptance criteria:

- Build/test evidence is recorded.
- Production health evidence is recorded when requested.
- DocsRAG ingestion/retrieval evidence is recorded or blocked with a credential note.

## Goal 8 - StateX Frontend Cutover To Leads Intake

Status: done

Intent: StateX direct contact/prototype frontend submissions must use Leads as the consent-aware non-registered lead intake service.

Chunks:

- [x] 8.1 Add a direct-form Leads submission helper in StateX frontend.
- [x] 8.2 Cut over `DirectForm` from platform notification calls to Leads public intake.
- [x] 8.3 Validate frontend build without production lead mutation.

Acceptance criteria:

- Direct forms submit to `POST /api/leads/submit` through the existing Leads public URL env contract.
- Supported contact campaignId types are preserved.
- No raw contact values or raw messages are added to frontend logs.
- No production lead creation is used as validation.

## Goal 9 - AI/CRM Payload Contract Tests

Status: done

Intent: Future AI/CRM payload construction must remain minimized and must not leak raw lead data.

Chunks:

- [x] 9.1 Add a local sanitized AI/CRM context builder.
- [x] 9.2 Add focused contract tests for sensitive-field omission.
- [x] 9.3 Validate focused tests and build.

Acceptance criteria:

- Tests use synthetic values only.
- Serialized AI/CRM context omits contact values, raw messages, confirmation tokens, private URL path/query, metadata values, and consent source value.
- No AI client, CRM client, raw export, production read, or deployment is added.

## Goal 10 - Leads Frontend Landing And Admin Pages

Status: done

Intent: Leads must expose a customer-facing landing page and an operator-facing admin dashboard shell without weakening consent, privacy, retrieval, or outreach boundaries.

Chunks:

- [x] 10.1 Add landing page for potential customers.
- [x] 10.2 Add admin dashboard shell for authorized operators.
- [x] 10.3 Serve frontend assets from the Leads Nest runtime and Docker image.
- [x] 10.4 Validate build, tests, lint, screenshots, and sensitive-data handling.

Acceptance criteria:

- `/` serves a polished customer landing page with request-access intake.
- `/admin` serves a dashboard shell with metrics, source mix, consent health, confirmation queue, filters, recent leads, and selected lead detail.
- Admin data loads only through guarded Leads APIs after credentials are supplied.
- Contact values are masked in browser-rendered admin views.
- No raw lead export, mass outreach, schema change, or ownership drift is added.

## Goal 11 - Ecosystem Lead Lifecycle Contracts

Status: done

Intent: Leads must become the ecosystem core warm-contact ledger and consent authority for non-registered contacts while preserving strict service boundaries with Auth, Marketing, Notifications, CRM, product applications, Billing, Logging, and AI.

Chunks:

- [x] 11.1 Document ecosystem architecture, ownership boundaries, funnel model, and phased implementation roadmap.
- [x] 11.2 Define implementation-ready lifecycle event contracts for lead submission, confirmation, preference updates, Auth conversion linkage, and campaign eligibility.
- [x] 11.3 Define Auth-backed tenant and admin access requirements before replacing the temporary internal-token admin shell.
- [x] 11.4 Define Marketing campaign eligibility and human approval contract using Leads consent and unsubscribe state.
- [x] 11.5 Define CRM service boundary, minimal schema, and safe read/reveal contracts before CRM runtime implementation.
- [x] 11.6 Define product-app integration contract and source taxonomy for Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, StateX, and future B2C apps.

Acceptance criteria:

- Service ownership is explicit: Leads owns non-registered intake, consent, confirmation, preferences, and unsubscribe; Auth owns identity/RBAC/tenancy; Marketing owns campaigns; Notifications owns delivery; CRM owns funnel workflow; Billing owns paid-customer facts.
- Lifecycle contracts are minimized by default and do not include raw contact values, raw messages, confirmation tokens, private URLs, or metadata values unless an active owner-approved task names exact fields, destination, retention, and validation.
- Campaign eligibility requires affirmative consent evidence and no unsubscribe state, with human approval before campaign execution.
- Auth lead-to-user linking requires verified contact ownership or explicit conversion token and does not use raw bulk lead export.
- Product app integrations use a shared Leads intake contract and synthetic contract tests.
- CRM implementation is separated from Leads once funnels, assignments, activities, notes, campaign membership, tenancy, and conversion history become runtime domains.
- No mass outreach, raw lead export, production lead mutation, or deployment is included in this goal unless separately approved.

## Goal 12 - Lifecycle And Product-App Contract Builders

Status: done

Intent: Leads must turn the Goal 11 lifecycle and product-app intake contracts into local, testable builders before cross-service runtime integration.

Chunks:

- [x] 12.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 12.2 Add minimized lifecycle event builders and focused contract tests.
- [x] 12.3 Add product-app intake payload helpers, taxonomy constants, safe log summary, and focused contract tests.
- [x] 12.4 Validate focused tests, build, documentation scans, and sensitive-data handling.

Acceptance criteria:

- Lifecycle event builders emit minimized payloads and omit raw contact values, raw messages, confirmation tokens, private URLs, metadata values, and consent source values.
- Product-app intake helpers define source taxonomy, source labels, metadata allowlist, canonical payload builder, and safe log summary.
- Product-app helper tests prove generated payloads are compatible with `CreateLeadDto` validation.
- No event emission, controller routes, Prisma schema changes, product-app edits, raw export, campaign execution, notification send, AI enrichment, CRM export, production mutation, or deployment is added.

## Goal 13 - LeadSubmitted Lifecycle Event Adoption

Status: done

Intent: Leads must adopt the minimized `LeadSubmitted` lifecycle event builder in the local public intake flow without changing public API responses, schemas, campaign behavior, notification delivery, product apps, AI, CRM, or deployment.

Chunks:

- [x] 13.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 13.2 Record a minimized `LeadSubmitted` lifecycle event after successful lead creation through the existing logging integration.
- [x] 13.3 Add focused controller tests proving the lifecycle log payload is minimized.
- [x] 13.4 Validate focused tests, build, documentation scans, and sensitive-data handling.

Acceptance criteria:

- Public intake response shape is unchanged.
- Lifecycle logging metadata omits contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, and consent source values.
- No route, DTO, schema, product-app, campaign, notification delivery, AI, CRM, production mutation, or deployment behavior changes.


## Goal 14 - LeadConfirmed And LeadPreferenceUpdated Lifecycle Adoption

Status: done

Intent: Leads must adopt minimized confirmation and preference lifecycle events in runtime controller flows without changing public responses, schemas, campaign behavior, notification delivery, product apps, AI, CRM, or deployment.

Chunks:

- [x] 14.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 14.2 Record a minimized `LeadConfirmed` lifecycle event after successful public confirmation.
- [x] 14.3 Record minimized `LeadPreferenceUpdated` lifecycle events after preference updates and unsubscribe.
- [x] 14.4 Add focused controller tests proving lifecycle metadata remains minimized.
- [x] 14.5 Validate focused tests, build, documentation scans, and sensitive-data handling.

Acceptance criteria:

- Confirmation response shape is unchanged.
- Internal preference and unsubscribe guards remain unchanged.
- Lifecycle logging metadata omits contact values, confirmation tokens, private URL path/query values, raw metadata values, and consent source values.
- Preference lifecycle metadata includes only consent state summary, consent evidence presence, preferred channel, fallback count, unsubscribe timestamp, and update timestamp.
- No route, DTO, schema, product-app, campaign, notification delivery, Auth, AI, CRM, production mutation, or deployment behavior changes.


## Goal 15 - Lifecycle Routing And Auth Conversion Linkage

Status: done

Intent: Leads must centralize minimized lifecycle event routing for downstream consumers and record Auth conversion linkage evidence without raw lead export, schema changes, public API changes, campaign execution, or external Auth ownership drift.

Chunks:

- [x] 15.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 15.2 Add `LeadLifecycleEventRouterService` for consumer-route metadata through the existing logging integration.
- [x] 15.3 Refactor existing controller lifecycle events to use the router.
- [x] 15.4 Add guarded Auth conversion-link endpoint that records minimized `LeadConvertedToUser` lifecycle events.
- [x] 15.5 Add focused tests for routing, guard metadata, and sensitive-data minimization.
- [x] 15.6 Validate focused tests, build, full tests, documentation scans, and sensitive-data handling.

Acceptance criteria:

- Lifecycle event routing metadata lists intended internal consumers and does not include raw contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, JWTs, session tokens, or raw consent source values.
- Auth conversion linkage records only minimized conversion evidence and does not create registered users or infer identity from raw lead export.
- The conversion-link endpoint remains internal-service guarded.
- Existing public response shapes and existing schemas remain unchanged.


## Goal 16 - Marketing Campaign Eligibility Preview

Status: done

Intent: Leads must provide Marketing with guarded, minimized campaign eligibility evidence based on consent, unsubscribe, confirmation, and channel support without raw contact export or campaign execution.

Chunks:

- [x] 16.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 16.2 Add campaign eligibility preview DTO.
- [x] 16.3 Add deterministic service eligibility evaluation.
- [x] 16.4 Add guarded internal preview endpoint with audit-safe summary logging.
- [x] 16.5 Add focused tests for eligibility reasons, guard coverage, and sensitive-data omission.
- [x] 16.6 Validate focused tests, full tests, build, documentation scans, and sensitive-data handling.

Acceptance criteria:

- Request is limited to at most 30 candidate lead IDs.
- Response includes lead IDs, eligibility booleans, deterministic reason codes, contact campaignId types, preferred channel, fallback count, consent evidence summary, confirmation state, unsubscribe state, and aggregate summary only.
- Response and logs omit contact values, raw messages, confirmation tokens, full source URLs, private path/query values, metadata values, campaign content, JWTs, and session tokens.
- Endpoint is guarded by `InternalServiceGuard`.
- No campaign execution, contact resolution, schema change, production mutation, AI export, CRM export, or deployment is added.


## Goal 17 - Controlled Contact Resolution

Status: done

Intent: Leads must provide bounded contact resolution for one lead and approved operational purposes without creating raw export, campaign execution, or notification dispatch behavior.

Chunks:

- [x] 17.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 17.2 Add contact resolution DTO.
- [x] 17.3 Add service logic for requested-channel filtering and campaign eligibility re-checking.
- [x] 17.4 Add guarded internal endpoint with audit-safe logging.
- [x] 17.5 Add focused tests for contact return, log minimization, approval requirements, and eligibility suppression.
- [x] 17.6 Validate focused tests, full tests, build, documentation scans, and sensitive-data handling.

Acceptance criteria:

- Endpoint resolves one lead per request.
- `approved_campaign_send` requires approval evidence and re-checks eligibility before returning contact values.
- Response returns only requested channel contact values.
- Logs omit returned contact values.
- No batch export, campaign execution, Notifications dispatch, approval storage, schema change, production mutation, deployment, AI export, or CRM export is added.

## Goal 18 - Durable Lifecycle Event Storage

Status: done

Intent: Leads must durably store minimized lifecycle events for non-registered leads so internal consumers can replay or retrieve lifecycle evidence without raw lead export, campaign execution, notification dispatch, CRM workflow ownership, or Auth identity ownership drift.

Chunks:

- [x] 18.1 Select durable lifecycle event storage as the next runtime slice and create execution artifacts.
- [x] 18.2 Add a Prisma-backed lifecycle event persistence model and migration using minimized event fields only.
- [x] 18.3 Update `LeadLifecycleEventRouterService` to persist events before logging route metadata.
- [x] 18.4 Add a guarded lifecycle event retrieval endpoint using the Goal 11 contract.
- [x] 18.5 Add focused tests for persistence, idempotency, minimized payloads, and retrieval bounds.
- [x] 18.6 Validate focused tests, full tests, build, Prisma generation/migration checks, documentation scans, and sensitive-data handling.

Acceptance criteria:

- Durable records store minimized lifecycle event envelopes only.
- Stored payloads omit contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, and campaign content.
- Idempotency prevents duplicate records for the same lifecycle transition.
- Retrieval is guarded by `InternalServiceGuard` and bounded to one lead at a time.
- Public API response shapes are unchanged.
- Logging remains metadata-only and does not become the durable event store owner.
- No Auth login/JWT validation, campaign execution, Notifications dispatch, CRM workflow, AI export, raw lead export, production lead mutation, or deployment is included without separate owner approval.

## Goal 19 - Auth-Backed Admin API Authentication

Status: done

Intent: Leads browser/admin APIs must validate Auth-issued bearer tokens and enforce Leads admin roles without exposing raw lead data or reusing internal service tokens for human users.

Chunks:

- [x] 19.1 Create execution artifacts and pass the pre-coding gate.
- [x] 19.2 Add Auth validation guard using Auth POST /auth/validate.
- [x] 19.3 Add masked Auth-backed admin list, detail, and summary APIs.
- [x] 19.4 Update admin browser shell to use Auth bearer tokens.
- [x] 19.5 Add focused tests for guard, admin APIs, masking, and preserved internal-service guards.
- [x] 19.6 Validate tests, build, lint, deployment, migration, health, admin 401, and scans.

Acceptance criteria:

- Browser/admin APIs require Auth bearer tokens and accepted Leads roles.
- Internal service routes remain protected by InternalServiceGuard.
- Admin responses are masked/minimized by default.
- Auth tokens, secrets, raw contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, and raw consent source values are not logged or returned from admin APIs.
- Tenant/workspace scoping remains a documented follow-up until Auth mapping semantics are confirmed.

## Goal 20 - Auth Workspace-Scoped Admin Isolation

Status: done

Intent: Leads admin APIs must enforce workspace-scoped reads for non-global Auth admins using a Leads-owned sourceService mapping while keeping Auth as the identity and RBAC authority.

Chunks:

- [x] 20.1 Confirm Auth does not currently define a concrete workspace schema or required workspace claim.
- [x] 20.2 Select sourceService mapping as the first tenant isolation layer.
- [x] 20.3 Normalize optional Auth workspace/tenant claims in AdminAuthGuard.
- [x] 20.4 Apply scoped sourceService filters to admin summary, list, and detail reads.
- [x] 20.5 Add focused tests for scope propagation, missing workspace rejection, source filtering, and hidden detail behavior.
- [x] 20.6 Validate tests, build, lint, scans, deployment, and smoke checks.

Acceptance criteria:

- Non-global admin reads require Auth workspace scope and LEADS_ADMIN_WORKSPACE_SOURCE_MAP.
- global:superadmin remains platform-wide.
- Cross-workspace sourceService reads return no list rows or hidden not-found detail behavior.
- Admin responses remain minimized and do not expose raw lead data.
- No Auth runtime, Prisma schema, public intake, internal service guard, outreach, AI/CRM export, or notification behavior changes.

## Goal 21 - Sanitized AI/CRM Context API

Status: done

Parallel status: completed and deployed.

Intent: Provide a guarded, minimized context API for approved AI/CRM analysis without exporting raw lead data or moving AI/CRM ownership into Leads.

Blockers:

- Any raw lead export, AI enrichment, CRM workflow ownership, or production mutation remains blocked unless the owner approves exact fields, destination, retention, and validation evidence.

Acceptance criteria:

- Sanitized context omits raw contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, and campaign content.
- API access remains guarded and minimized.
- Build/tests and sensitive-data scans are recorded in goal evidence.
- Deployment evidence is recorded separately; future deployment changes still require owner approval.

## Goal 22 - Production Auth Workspace Token Matrix Validation

Status: done

Parallel status: complete after owner-approved masked synthetic Auth validation path; synthetic Auth validation users were removed after the smoke.

Intent: Validate the deployed Goal 20 admin isolation behavior with real or owner-approved synthetic Auth tokens without printing tokens, raw lead data, or production lead rows.

Suggested owner: Agent A.

Allowed file scope:

- `implementation-goals/GOAL-22-*`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and `STATE.json` when state changes
- smoke scripts or validation notes only if approved by the owner

Blockers:

- None for Goal 22. Positive global and non-global scoped validation passed with masked evidence. Production mutation remains generally blocked unless the owner approves exact synthetic payloads.

Chunks:

- [x] 22.1 Create execution artifacts and pass the pre-coding gate.
- [x] 22.2 Validate unauthenticated and invalid-token admin rejection.
- [x] 22.3 Validate global superadmin platform-wide read with masked outputs only.
- [x] 22.4 Validate non-global workspace source scoping when approved tokens are available.
- [x] 22.5 Record evidence without secrets, raw contact values, raw messages, confirmation tokens, or production lead rows.

Acceptance criteria:

- Health and admin rejection smoke checks pass.
- Any real-token validation records token presence, role/scope class, endpoint status, and masked/minimized response shape only.
- Non-global admin reads are either validated with approved tokens or remain blocked with a concrete token requirement.
- No source change, schema change, raw lead export, outreach, AI/CRM export, or production mutation is introduced.

## Goal 23 - Admin UI Scope Messaging And Empty-State Hardening

Status: complete

Parallel status: complete by Agent B; no runtime API contract change introduced.

Intent: Improve the admin browser shell so scoped admins understand empty or hidden results without exposing raw lead data or Auth internals.

Suggested owner: Agent B.

Allowed file scope:

- admin frontend static assets and focused UI tests
- `implementation-goals/GOAL-23-*`
- status/state docs when the goal state changes

Blockers:

- Runtime API contract changes are serialized behind the owner of the admin API track.
- Browser screenshots must use synthetic, unauthenticated, or masked data only.

Chunks:

- [x] 23.1 Create execution artifacts and pass the pre-coding gate.
- [x] 23.2 Add scoped-empty, hidden-detail, unauthorized, and token-missing UI states.
- [x] 23.3 Add focused UI tests or browser validation for those states.
- [x] 23.4 Validate build, lint/tests, screenshots, and sensitive-data scans.

Acceptance criteria:

- Admin UI does not show raw contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, tokens, or secret material.
- Empty scoped reads and hidden details are clear to operators without revealing another workspace exists.
- No API, schema, Auth, outreach, AI/CRM, notification, or deployment behavior changes are included unless separately approved.

## Goal 24 - Internal Lifecycle Event Replay Consumer Contract

Status: done

Parallel status: docs/builders/tests complete by Agent C; serialized for runtime route changes.

Intent: Define and test how trusted internal consumers can replay minimized lifecycle events without making Leads the logging owner or exposing raw lead data.

Suggested owner: Agent C.

Allowed file scope:

- lifecycle contract docs, builders, DTOs, focused tests
- `implementation-goals/GOAL-24-*`
- status/state docs when the goal state changes

Blockers:

- Runtime route changes require owner selection of first consumer and must serialize with any guarded API changes.
- Any new durable storage or Prisma migration is blocked behind a dedicated migration owner.

Chunks:

- [x] 24.1 Create execution artifacts and pass the pre-coding gate.
- [x] 24.2 Define replay request/response contract and consumer constraints.
- [x] 24.3 Add minimized contract builders and focused tests.
- [x] 24.4 Validate build, tests, determinism, and sensitive-data scans.

Acceptance criteria:

- Replay contract is bounded, guarded, deterministic, and minimized.
- Payloads omit contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, and campaign content.
- Logging remains the centralized log owner; Leads only serves its own minimized lifecycle evidence.

## Goal 25 - Marketing Approval Evidence Handoff Contract

Status: done

Parallel status: completed by Agent D for docs/builders/tests; runtime approval storage remains blocked until ownership is confirmed.

Intent: Specify how Marketing can provide human approval evidence for campaign contact resolution while Leads preserves consent, unsubscribe, and no-mass-outreach boundaries.

Suggested owner: Agent D.

Allowed file scope:

- marketing eligibility/approval contract docs, builders, DTOs, focused tests
- `implementation-goals/GOAL-25-*`
- status/state docs when the goal state changes

Blockers:

- Approval storage ownership must remain Marketing unless the owner explicitly selects a Leads-owned approval evidence slice.
- Campaign execution and mass outreach are blocked without human review and owner approval.

Chunks:

- [x] 25.1 Create execution artifacts and pass the pre-coding gate.
- [x] 25.2 Define approval evidence fields, purpose codes, retention expectation, and audit-safe summaries.
- [x] 25.3 Add focused tests proving no campaign content or contact export is added.
- [x] 25.4 Validate build, tests, and sensitive-data scans.

Acceptance criteria:

- Contract requires affirmative consent evidence, no unsubscribe state, bounded purpose, and human approval reference before contact resolution.
- Leads does not execute campaigns, store campaign content, or initiate outbound sends.
- No raw contact export, AI export, CRM export, production mutation, schema migration, or deployment is included unless separately approved.

## Goal 26 - Product-App Intake Compatibility Matrix

Status: done for Leads-side synthetic matrix

Parallel status: Agent E completed Leads-side matrix; cross-repo app edits remain blocked until owner selects target apps.

Intent: Prove approved product-app intake payloads remain compatible with Leads public validation and source taxonomy.

Suggested owner: Agent E.

Allowed file scope:

- product source taxonomy docs/tests and synthetic fixtures in Leads
- `implementation-goals/GOAL-26-*`
- status/state docs when the goal state changes

Blockers:

- Editing StateX, Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, or other product apps is blocked until the owner selects that app and repository.
- Production intake mutation validation is blocked without exact owner-approved synthetic payloads.

Chunks:

- [x] 26.1 Create execution artifacts and pass the pre-coding gate.
- [x] 26.2 Build synthetic payload fixtures for approved source services and contact campaignId types.
- [x] 26.3 Validate fixtures against `CreateLeadDto` without sending production submissions.
- [x] 26.4 Record compatibility risks and cross-repo follow-ups.

Acceptance criteria:

- Synthetic matrix covers approved product-app source services and supported contact campaignIds.
- Tests use synthetic values only and do not submit to production.
- No product-app code, raw contact export, campaign execution, AI/CRM export, schema change, or deployment is included.

## Goal 27 - Documentation Ingestion And Orchestrator Freshness

Status: done

Parallel status: completed by Agent F as documentation-only integration lane.

Intent: Keep the Leads orchestrator, implementation state, DocsRAG evidence, and parallel execution board current after recent runtime goals.

Owner: Agent F. Completed on 2026-06-13.

Allowed file scope:

- `docs/orchestrator/*`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/README.md`
- `TASKS.md`
- `STATE.json`
- `AGENTS.md`

Blockers:

- Plain SSH shell lacks `JWT_TOKEN`; in-cluster ingestion returned HTTP 202, and in-cluster agent-context retrieval returned HTTP 500 after ingestion.

Chunks:

- [x] 27.1 Create or update documentation-only execution artifacts and pass the pre-coding gate.
- [x] 27.2 Refresh current state, completed goals, active blockers, and parallel execution board.
- [x] 27.3 Run documentation-only validation and DocsRAG retrieval when available.
- [x] 27.4 Record continuation evidence.

Acceptance criteria:

- Orchestrator docs and state files agree on active, pending, blocked, and parallel-ready goals.
- Documentation-only checks pass.
- DocsRAG retrieval evidence is recorded, or the credential/runtime limitation is explicit.
- No runtime source, schema, deployment, secret, production mutation, raw lead export, outreach, AI/CRM export, or notification behavior changes are included.

## Goal 28 - Parallel Integration Validation And Deployment Readiness

Status: done

Parallel status: serialized integration lane completed and deployed after owner approval.

Intent: Validate accumulated Goal 23-26 runtime/test changes together before any deployment, while preserving Goal 22 token blocker and all sensitive-data boundaries.

Owner: coordinator.

Allowed file scope:

- validation/status/state docs
- no runtime source edits unless validation reveals an integration defect

Blockers:

- None. Goal 28 deployment was completed after owner approval. Goal 22 positive token matrix is complete.

Chunks:

- [x] 28.1 Review parallel thread results for Goals 22-27.
- [x] 28.2 Reconcile completed, active, and blocked state.
- [x] 28.3 Run full integration validation across accumulated Goal 23-26 changes.
- [x] 28.4 Record deployment-readiness evidence without deploying.

Acceptance criteria:

- Full test suite, build, lint, missing-marker scan, secret-pattern scan, and diff check pass.
- Goal 22 token validation is complete with masked evidence.
- Deployment evidence is recorded after owner approval; no raw lead export, outreach, AI/CRM export, or notification behavior was performed.

## Goal 29 - Orders Event Consumer Contract For Leads

Status: production-enablement-blocked

Parallel status: Goal 7.4 Leads lane contract guard complete; transport-independent handler and disabled-by-default live broker adapter complete; production enablement dependency-gated.

Intent: Leads may consume canonical Orders lifecycle events as read-only minimized signals for attribution and follow-up, but Leads must not duplicate Orders state, infer lead attribution from unsafe fields, or become order source of truth.

Owner: Orders production rollout Goal 7.4 Leads integration owner.

Allowed file scope:

- `src/leads/integrations/orders-order-created-consumer-contract.ts`
- `src/leads/integrations/orders-order-created-consumer-contract.spec.ts`
- `implementation-goals/GOAL-29-orders-event-consumer-contract*`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/PLAN.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`

Forbidden file scope:

- Orders, Marketing, Notifications, Warehouse, Catalog, marketplace, deployment, Vault, Prisma schema, and migration files until missing contracts are resolved.

Blockers:

- `[MISSING: replay/backfill validation source for missed Orders events]`

Chunks:

- [x] 29.1 Verify Orders event source and Leads broker/runtime support.
- [x] 29.2 Create execution plan, context package, coding prompt, and validation report.
- [x] 29.3 Add focused contract guard and tests for `orders.order.created.v1`.
- [x] 29.4 Record runtime blockers and validation evidence.
- [x] 29.5 Implement transport-independent runtime handler for created events.
- [x] 29.6 Define Leads-owned RabbitMQ env names and add disabled-by-default live broker adapter.
- [x] 29.7 Wire production RabbitMQ secret/config values and broker connect smoke.
- [ ] 29.8 Deploy, verify queue binding/runtime health, and define replay/backfill validation source.

Acceptance criteria:

- Current canonical `orders.order.created.v1` fixture is recognized and idempotently skipped when `payload.leadAttribution.leadId` is absent.
- Explicit `payload.leadAttribution.leadId` synthetic fixture builds a minimized `LeadOrderAttributed` lifecycle event candidate.
- Duplicate event ID and duplicate order idempotency key deliveries are ignored.
- No public API, internal API, schema, migration, deployment config, runtime queue consumer, raw lead export, campaign execution, notification dispatch, AI/CRM export, production data read, or production mutation is added.
- Live broker adapter remains disabled until production RabbitMQ secret/config wiring, broker smoke approval, and replay/backfill validation are explicit.

