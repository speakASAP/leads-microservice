# Goal 14 Context Package

## Source Context

- Leads already owns non-registered lead intake, confirmation, preferences, unsubscribe, and consent evidence.
- Goal 11 defined minimized lifecycle event contracts and service boundaries.
- Goal 12 added local lifecycle event builders.
- Goal 13 adopted `LeadSubmitted` in public intake through the existing logging integration.

## Current Runtime Shape

- `confirmLead` returns the existing confirmation response from `LeadsService.confirmLead`.
- `updateLeadPreferences` and `unsubscribeLead` are guarded internal routes.
- `LoggingService.log` is the current local observability integration; no message bus exists in this slice.

## Sensitive Data Classification

- Raw contact values, raw messages, confirmation tokens, private URL paths and queries, metadata values, and consent source values are sensitive.
- Lifecycle event payloads are classified as minimized metadata only.

## Constraints

- Preserve existing public confirmation response shape.
- Do not add outbound delivery, campaign execution, AI/CRM export, raw reveal, schema migration, or production mutation.
- Use synthetic values only in tests and documentation examples.
