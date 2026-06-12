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

Status: pending

Intent: Lead retrieval, list, preference, and unsubscribe APIs must expose only the minimum necessary data through controlled paths.

Chunks:

- [ ] 3.1 Audit `GET /api/leads`, `GET /api/leads/:id`, and internal preference endpoints.
- [ ] 3.2 Verify or add access controls for non-public lead retrieval.
- [ ] 3.3 Preserve the max 30 items per list request.
- [ ] 3.4 Add validation evidence for trusted internal-service headers.

Acceptance criteria:

- Raw lead retrieval is not public unless owner-approved and documented.
- Internal preference and unsubscribe APIs require the service guard.
- Pagination and bounds remain enforced.
- No raw production lead data appears in logs, docs, prompts, or tests.

## Goal 4 - Notification And Confirmation Reliability

Status: pending

Intent: Lead confirmation requests must remain observable and privacy-safe without making Leads the notification delivery owner.

Chunks:

- [ ] 4.1 Review notifications-microservice call contract and error handling.
- [ ] 4.2 Verify confirmation token handling does not leak sensitive values in logs or docs.
- [ ] 4.3 Add focused tests or smoke evidence for notification failure behavior.
- [ ] 4.4 Document notification ownership boundary.

Acceptance criteria:

- Confirmation behavior is reliable and observable.
- Notification failures do not corrupt lead creation state.
- Tokens and raw messages are not leaked in logs or validation reports.
- Notifications remain notifications-microservice-owned.

## Goal 5 - AI And CRM Data-Sharing Boundary

Status: pending

Intent: AI and CRM integrations must use minimum necessary lead context and never export raw lead data without explicit owner approval.

Chunks:

- [ ] 5.1 Identify current and intended AI/CRM call paths.
- [ ] 5.2 Define redaction, minimization, and approval rules.
- [ ] 5.3 Add a validation checklist for prompts, logs, and integration payloads.
- [ ] 5.4 Split implementation work into owner-approvable chunks.

Acceptance criteria:

- AI/CRM integration data classes are documented.
- Raw lead export requires explicit owner approval in the active task.
- Validation reports include sensitive-data handling evidence.

## Goal 6 - Operational Smoke And Documentation Ingestion

Status: pending

Intent: Leads must prove production readiness with health, build, tests, and documentation retrieval evidence.

Chunks:

- [ ] 6.1 Run `npm run build` and `npm test`.
- [ ] 6.2 Verify `https://leads.alfares.cz/health`.
- [ ] 6.3 Trigger DocsRAG ingestion when credentials are available.
- [ ] 6.4 Verify retrieval returns the current Leads IPS docs.

Acceptance criteria:

- Build/test evidence is recorded.
- Production health evidence is recorded when requested.
- DocsRAG ingestion/retrieval evidence is recorded or blocked with a credential note.
