# Goal 2 - Lead Intake Contract And Consent Hardening

```yaml
id: LEADS-GOAL-02
status: done
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
downstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.execution-plan.md
  - GOAL-02-lead-intake-contract-and-consent-hardening.context-package.md
  - GOAL-02-lead-intake-contract-and-consent-hardening.coding-prompt.md
  - GOAL-02-lead-intake-contract-and-consent-hardening.validation-report.md
```

## Intent

Public lead submission must remain bounded, validated, consent-aware, and safe for approved consumer services.

## Selected Chunk

Chunk 2.4 - Record consumer compatibility risks for sgiprealestate, statex, and marketing-microservice.

## Acceptance Criteria

- Public intake validation behavior is documented and tested.
- Consent evidence behavior is explicit.
- Existing approved consumers remain compatible or have a migration note.
- Existing tests and build pass with synthetic values only.

## Consumer Compatibility Risk Register

Current public intake endpoint: `POST /api/leads/submit`.

Current bounded contract:

- `sourceService`: required non-empty string.
- `message`: required non-empty string.
- `contactMethods`: required array with 1 to 30 items.
- `contactMethods[].type`: one of `email`, `telegram`, or `whatsapp`.
- `contactMethods[].value`: required non-empty string.
- `preferredChannel`: optional `email`, `telegram`, `whatsapp`, or `none`.
- `fallbackChannels`: optional string array with at most 10 items.
- `marketingConsent`: optional boolean.
- `consentSource`: required non-empty string when `marketingConsent` is `true`; optional otherwise, but validated if supplied.
- `consentCapturedAt`: required ISO8601 timestamp when `marketingConsent` is `true`; optional otherwise, but validated if supplied.

Consumer risks:

| Consumer | Compatibility status | Risk | Migration note |
| --- | --- | --- | --- |
| `sgiprealestate` | Compatible with migration note | Public property forms must send at least one supported contact method. Payloads using unsupported channel labels such as `phone`, `sms`, or custom form labels are rejected after chunk 2.1. | Map lead phone/SMS-style inputs to a supported channel only when the business meaning is actually `whatsapp`; otherwise collect `email`, `telegram`, or `whatsapp` before submission. If affirmative marketing opt-in is presented, send `marketingConsent: true`, a stable `consentSource`, and ISO8601 `consentCapturedAt`. |
| `statex` | Compatible with migration note | Statex submitters must preserve the max-30 contact-method bound and must not send affirmative marketing consent without evidence. Missing or `false` marketing consent remains compatible as no opt-in. | Keep service-specific context in `metadata`, not in custom contact method types. For opt-in flows, pass source and timestamp evidence from the capture UI. |
| `marketing-microservice` | Compatible with migration note | Marketing reads Leads contact, preference, and consent fields for non-registered contacts. It must not treat missing consent evidence, `marketingConsent: false`, or `marketingConsent: null` as targetable consent. | Target only leads with explicit `marketingConsent: true` and populated `consentSource` plus `consentCapturedAt`. Do not infer campaign eligibility from contact-method presence or source service alone. |

Documentation gap:

- `README.md` references `docs/EXTERNAL_INTEGRATION.md`, but that file is absent in the current repository. The risk register above is the active compatibility note for Goal 2 until a dedicated external integration document is added.

## Non-Goals

- No production lead mutation.
- No raw lead data export.
- No outreach automation.
- No Auth, Notifications, Marketing, Logging, database infrastructure, AI, or deployment ownership changes.
