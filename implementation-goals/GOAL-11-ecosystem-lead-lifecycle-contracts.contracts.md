# Goal 11 Contracts - Ecosystem Lead Lifecycle

```yaml
id: LEADS-GOAL-11-LIFECYCLE-CONTRACTS
status: approved
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - future source execution plans
```

## Purpose

Define implementation-ready ecosystem contracts for moving warm contacts from non-registered Leads intake toward registered paid customers without weakening consent, privacy, or service ownership boundaries.

These contracts are source-of-truth planning artifacts. They do not create runtime behavior by themselves.

## Contract Principles

- Minimized by default: events and eligibility APIs do not include raw contact values, raw messages, confirmation tokens, private URL path/query values, or metadata values.
- Consent-first: Marketing eligibility requires affirmative consent evidence and no unsubscribe state.
- Human-reviewed: campaign send execution requires a recorded human approval outside Leads.
- Auth-owned identity: lead-to-user linking requires verified contact ownership or explicit conversion token from Auth.
- Notifications-owned delivery: Notifications sends; it does not decide audience membership.
- CRM-owned workflow: CRM owns funnels, tasks, notes, assignments, opportunities, and campaign membership review once implemented.
- Leads-owned evidence: Leads remains the source of non-registered intake, consent, confirmation, preferences, and unsubscribe state.

## Shared Event Envelope

All lifecycle events should use this envelope.

```json
{
  "eventId": "uuid",
  "eventType": "LeadSubmitted",
  "eventVersion": 1,
  "occurredAt": "2026-06-13T00:00:00.000Z",
  "producer": "leads-microservice",
  "leadId": "uuid",
  "correlationId": "optional-string",
  "idempotencyKey": "optional-string",
  "dataClass": "minimized",
  "payload": {}
}
```

Rules:

- `eventId` is unique per emitted event.
- `eventVersion` starts at `1`; additive compatible fields may keep the same version only when consumers tolerate absence.
- `occurredAt` is producer-side UTC ISO timestamp.
- `leadId` is safe as an internal reference but must not be treated as contact permission.
- `dataClass` must be `minimized` unless an owner-approved task explicitly defines another class.

## Event: `LeadSubmitted` v1

Producer: `leads-microservice`

Consumers: CRM, Marketing, analytics/reporting, product orchestration services.

Purpose: announce a new warm contact without exposing raw contact or message content.

```json
{
  "leadId": "uuid",
  "status": "new",
  "sourceService": "shop-assistant",
  "sourceLabel": "pricing-interest",
  "sourceHost": "example.com",
  "contactMethodTypes": ["email"],
  "contactMethodCount": 1,
  "preferredChannel": "email",
  "fallbackChannelCount": 0,
  "marketingConsent": true,
  "consentEvidencePresent": true,
  "confirmed": false,
  "unsubscribed": false,
  "createdAt": "2026-06-13T00:00:00.000Z"
}
```

Forbidden fields:

- contact method values
- raw message
- metadata values
- `confirmationToken`
- full `sourceUrl`
- source URL path/query

## Event: `LeadConfirmed` v1

Producer: `leads-microservice`

Consumers: CRM, Marketing, analytics/reporting.

Purpose: announce verified lead confirmation.

```json
{
  "leadId": "uuid",
  "sourceService": "speakup",
  "confirmedAt": "2026-06-13T00:00:00.000Z"
}
```

Forbidden fields:

- confirmation token
- email or other contact value
- raw confirmation URL

## Event: `LeadPreferenceUpdated` v1

Producer: `leads-microservice`

Consumers: Marketing, CRM, Notifications suppression handling, analytics/reporting.

Purpose: announce consent, channel preference, or unsubscribe changes.

```json
{
  "leadId": "uuid",
  "marketingConsent": false,
  "consentEvidencePresent": true,
  "preferredChannel": "telegram",
  "fallbackChannelCount": 1,
  "unsubscribedAt": "2026-06-13T00:00:00.000Z",
  "updatedAt": "2026-06-13T00:00:00.000Z"
}
```

Rules:

- Marketing must treat `marketingConsent: false` or non-null `unsubscribedAt` as ineligible.
- Missing consent evidence must block marketing campaign eligibility.
- This event is not a send instruction.

## Event: `LeadConvertedToUser` v1

Producer: Auth or Leads after Auth-confirmed linkage.

Consumers: CRM, Marketing, product apps, analytics/reporting.

Purpose: connect warm-contact attribution to a registered user without moving identity ownership into Leads.

```json
{
  "leadId": "uuid",
  "userId": "auth-user-id",
  "sourceService": "marathon",
  "linkMethod": "verified_contact",
  "linkedAt": "2026-06-13T00:00:00.000Z"
}
```

Allowed `linkMethod` values:

- `verified_contact`
- `conversion_token`
- `owner_reviewed_manual_link`

Rules:

- Auth owns user identity and contact verification.
- Leads may store a reference to `userId` only as conversion metadata.
- Bulk raw lead queries must not be used for identity inference.

## API Contract: Campaign Eligibility

Owner: Leads provides eligibility evidence; Marketing owns campaign policy and execution.

Recommended endpoint:

```http
POST /api/leads/internal/campaign-eligibility
```

Guard:

- trusted internal service authentication
- expected caller: `marketing-microservice` or future `crm-microservice`
- tenant/workspace claims after Auth-backed tenancy exists

Request:

```json
{
  "leadIds": ["uuid"],
  "purpose": "product_nurture",
  "channel": "email",
  "requireConfirmed": true
}
```

Response:

```json
{
  "items": [
    {
      "leadId": "uuid",
      "eligible": true,
      "reasons": ["marketing_consent_true", "consent_evidence_present", "not_unsubscribed", "confirmed"],
      "preferredChannel": "email",
      "fallbackChannelCount": 0,
      "marketingConsent": true,
      "consentEvidencePresent": true,
      "unsubscribed": false,
      "confirmed": true
    }
  ]
}
```

Eligibility must be false when:

- `marketingConsent !== true`
- `consentSource` is missing
- `consentCapturedAt` is missing
- `unsubscribedAt` is present
- `requireConfirmed` is true and `confirmedAt` is missing
- service authentication or tenant scope is invalid

Response must not include contact values or raw messages.

## API Contract: Controlled Contact Resolution

Owner: Leads provides contact values only after approval gates. Marketing/CRM must not use list/detail endpoints as bulk export.

Recommended endpoint:

```http
POST /api/leads/internal/contact-resolution
```

Guard:

- trusted internal service authentication
- Auth-backed role/tenant claims when human/operator initiated
- campaign approval or CRM approval reference
- audit log required

Request:

```json
{
  "leadIds": ["uuid"],
  "purpose": "approved_campaign_delivery",
  "approvalId": "approval-id",
  "channel": "email"
}
```

Rules:

- Small batch only; default maximum should not exceed the current Leads list bound of 30 without owner approval.
- Must re-check campaign eligibility at resolution time.
- Must return only contact values required for the requested channel.
- Must audit caller, purpose, approval ID, lead IDs, channel, count, and timestamp without logging returned contact values.
- Must never return confirmation tokens, raw messages, source URL path/query, or metadata values.

## API Contract: Auth Lead Link

Owner: Auth verifies identity; Leads records conversion reference.

Recommended endpoint in Leads:

```http
POST /api/leads/internal/:id/link-user
```

Request:

```json
{
  "userId": "auth-user-id",
  "linkMethod": "verified_contact",
  "linkedAt": "2026-06-13T00:00:00.000Z"
}
```

Rules:

- Caller must be Auth or a trusted orchestrator with Auth verification evidence.
- Leads must not verify registered-user identity itself.
- No raw contact values are required in this request.
- Re-linking behavior must be idempotent or explicitly conflict-safe.

## Product App Intake Source Taxonomy

Initial stable `sourceService` values:

- `shop-assistant`
- `buzzos`
- `flipflop`
- `speakup`
- `marathon`
- `statex`
- `sgiprealestate`
- `leads-landing`

Recommended `sourceLabel` examples:

- `pricing-interest`
- `request-access`
- `book-demo`
- `waitlist`
- `trial-request`
- `feature-interest`
- `abandoned-intent`
- `newsletter`

Product apps must:

- use the shared Leads intake contract;
- include consent source and timestamp when marketing consent is true;
- avoid raw contact/message logging;
- use synthetic contract tests;
- keep app-specific sensitive metadata out of `metadata` unless separately approved.

## Runtime Implementation Order

1. Add contract tests for event payload builders using synthetic data.
2. Add lifecycle event builder module in Leads with minimized payloads only.
3. Add campaign eligibility DTO/service/controller guarded by internal service auth.
4. Add Auth link DTO/service/controller guarded by internal service auth.
5. Add controlled contact resolution only after owner approves approval/audit semantics.
6. Add product-app clients and contract tests app by app.
7. Add CRM service once workflow scope is approved.

## Explicit Non-Goals

- No raw lead export.
- No mass outreach.
- No campaign send execution.
- No delivery provider logic.
- No registered-user identity ownership in Leads.
- No AI raw-message enrichment.
- No billing or subscription ownership.
