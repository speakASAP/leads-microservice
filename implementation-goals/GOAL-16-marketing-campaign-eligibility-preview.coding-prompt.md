# Goal 16 Coding Prompt

Implement only Marketing eligibility preview:

- Guard endpoint with `InternalServiceGuard`.
- Return lead IDs, eligibility booleans, deterministic reason codes, contact method types, preferred channel, fallback count, and summary counts only.
- Do not return contact values, raw messages, confirmation tokens, full source URLs, metadata values, campaign content, approval records, or notification dispatch data.
- Do not add campaign execution, contact resolution, schema changes, production mutation, deployment, AI export, or CRM export.
