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

- [x] 2.1 Review `POST /api/leads/submit` request validation and contact method constraints.
- [x] 2.2 Define exact consent evidence requirements for marketing consent, consent source, and captured timestamp.
- [x] 2.3 Add or tighten tests for invalid contact methods, oversized arrays, invalid timestamps, and missing consent context where required.
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
- Supported contact method types are preserved.
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
