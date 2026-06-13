# Goal 5 - AI And CRM Data-Sharing Boundary

```yaml
id: LEADS-GOAL-05-AI-CRM-DATA-SHARING-BOUNDARY
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-05-ai-and-crm-data-sharing-boundary.execution-plan.md
  - GOAL-05-ai-and-crm-data-sharing-boundary.context-package.md
  - GOAL-05-ai-and-crm-data-sharing-boundary.coding-prompt.md
  - GOAL-05-ai-and-crm-data-sharing-boundary.validation-report.md
```

## Intent

AI and CRM integrations must use minimum necessary lead context and never export raw lead data without explicit owner approval in the active task.

## Completed Chunks

- [x] 5.1 Identify current and intended AI/CRM call paths.
- [x] 5.2 Define redaction, minimization, and approval rules.
- [x] 5.3 Add a validation checklist for prompts, logs, and integration payloads.
- [x] 5.4 Split implementation work into owner-approvable chunks.

## Current AI/CRM Call Paths

| Path | Current implementation | Data class | Boundary decision |
| --- | --- | --- | --- |
| AI microservice | `AI_SERVICE_URL` exists in configuration and `SYSTEM.md`, but no source client currently calls AI from Leads. | No current payload. Future payloads may include derived or minimized lead context only. | No AI export exists today. Any future AI payload must be approved, minimized, and validated before implementation. |
| CRM follow-up | `README.md`, `BUSINESS.md`, and `CLAUDE.md` describe CRM follow-up, but no CRM-specific client or endpoint exists in source. | No current CRM-specific payload. | No CRM export exists today. Future CRM integration must use guarded APIs and owner-approved field scope. |
| Marketing/CRM-like consumer read | `GET /api/leads`, `GET /api/leads/:id`, and internal preference/unsubscribe endpoints are guarded by `InternalServiceGuard`. DocsRAG confirms marketing-microservice reads Leads contact, preference, and consent fields for non-registered contacts. | Raw lead detail/list can include message/contact methods; preference endpoints expose minimized consent/preference state. | Guarded internal access only. Raw list/detail retrieval is sensitive and must not be used as bulk export without owner approval. Prefer preference endpoints when only consent state is needed. |
| Logging | `LoggingService` sends operational metadata to logging-microservice. Lead submit/retrieval logs use lead IDs, source service, page/limit, timestamps, durations, counts, and booleans. | Metadata, not raw lead content. | Logs must never include raw messages, contact method values, confirmation tokens, private URLs, or full integration payloads. |
| Notifications | Confirmation request payloads are sent to notifications-microservice. This is not AI/CRM, but it carries sensitive lead context for confirmation delivery. | Notification delivery context. | Notifications remain delivery-owner. Do not reuse notification payloads as AI/CRM input. |

## Data Classes

| Class | Examples | Default handling |
| --- | --- | --- |
| Public operational metadata | source service name, lead ID, counts, timestamps, page/limit, status flags | Allowed in logs and validation evidence when it does not identify a person or expose message content. |
| Consent/preference state | `marketingConsent`, `consentSource`, `consentCapturedAt`, `preferredChannel`, `fallbackChannels`, `unsubscribedAt` | Share only through trusted internal APIs and only for consent/preference decisions. Preserve GDPR evidence. |
| Contact data | email, telegram, whatsapp values, recipient fields | Sensitive. Do not put in docs, prompts, logs, tests, screenshots, or AI/CRM payloads unless owner approval names fields, destination, retention, and validation. |
| Lead narrative/context | submitted message, metadata values, source URL path/query, source label when identifying | Sensitive. Minimize or redact before AI/CRM use; raw export requires explicit active-task approval. |
| Confirmation/unsubscribe secrets | confirmation token, private confirmation URLs, internal service token | Secret/sensitive. Never export to AI/CRM and never record in docs or prompts. |
| Production rows/logs | database records, raw service logs containing lead details, CRM records | Sensitive. Do not copy into reports. Use masked summaries only when operational validation requires it. |

## Redaction And Minimization Rules

- Default AI/CRM payload posture: no payload until an owner-approved task names the destination, fields, retention, and validation evidence.
- Prefer derived metadata over raw values: counts, booleans, source service, consent flags, and timestamps are safer than contact values or message text.
- Prefer preference endpoints over raw list/detail retrieval when a consumer only needs consent or unsubscribe state.
- Remove or replace contact method values, raw messages, metadata values, confirmation tokens, source URL paths/query strings, and private URLs before prompts, logs, screenshots, validation reports, or integration payload captures.
- Redaction must happen before data leaves Leads for AI/CRM analysis, not only in downstream logs.
- Validation fixtures must use synthetic values only.
- Bulk or repeated reads for CRM/AI enrichment are treated as raw lead export unless the active task explicitly approves scope, purpose, destination, retention, and rollback.

## Owner Approval Record Required For Raw Export

Any raw AI/CRM lead export task must record all fields below before implementation:

- owner approval date and approver;
- destination service and endpoint;
- exact fields to be sent;
- whether contact methods, raw message, metadata values, source URLs, confirmation state, or consent evidence are included;
- purpose and human-review workflow;
- retention/deletion expectation at the destination;
- volume limit and pagination bound;
- validation commands using synthetic or masked data only;
- rollback/disable switch;
- evidence that no mass outreach is triggered by the export.

## Validation Checklist For Future AI/CRM Work

Before merging future AI/CRM integration work, verify and record:

- [ ] Does the task have explicit owner approval for every raw or identifying field?
- [ ] Is the payload minimized to the stated purpose?
- [ ] Are contact values, raw messages, metadata values, confirmation tokens, and private source URLs redacted from logs, prompts, tests, screenshots, and reports?
- [ ] Does the integration avoid campaign execution and mass outreach?
- [ ] Does it preserve `marketingConsent`, `consentSource`, `consentCapturedAt`, unsubscribe state, and confirmation evidence?
- [ ] Does the destination service retain ownership of its domain, with Leads only exposing approved lead context?
- [ ] Are list/page limits preserved at 30 or lower?
- [ ] Are trusted internal-service headers required where raw or preference data is read?
- [ ] Are validation commands deterministic and based on synthetic or masked data?
- [ ] Does the validation report state `No raw lead export` or include the approval record above?

## Owner-Approvable Follow-Up Chunks

1. AI sanitized-summary design: define a DTO/service that sends only redacted or derived lead context to AI for classification or prioritization; no contact values, confirmation tokens, private URLs, or raw metadata values.
2. CRM export design: define a guarded one-lead-at-a-time handoff with explicit field allowlist, consent evidence, retention expectation, and human-review workflow.
3. Raw export exception process: add a durable approval template and runtime kill switch before any bulk/raw lead export can be implemented.
4. Contract tests: add tests that assert AI/CRM payload builders omit contact values, raw messages, confirmation tokens, and private URLs.

## Non-Goals

- No runtime AI client implementation.
- No CRM client implementation.
- No raw lead export.
- No production lead reads or mutations.
- No campaign execution or mass outreach.
- No deployment.
