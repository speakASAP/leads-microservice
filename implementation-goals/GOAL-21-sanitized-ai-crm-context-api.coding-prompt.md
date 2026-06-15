# Goal 21 Coding Prompt

Implement Goal 21 chunk 21.1: add a guarded one-lead sanitized AI/CRM context retrieval API.

Use the existing `buildSanitizedAiCrmLeadContext` helper. The endpoint must be internal-service guarded and must not expose contact values, raw message text, confirmation tokens, private source URL path/query values, metadata values, or raw consent source values. Keep the change narrow, add focused service/controller tests, and do not add deployment, AI/CRM client calls, raw export, contact reveal, campaign execution, notification dispatch, public API changes, or schema migrations.
