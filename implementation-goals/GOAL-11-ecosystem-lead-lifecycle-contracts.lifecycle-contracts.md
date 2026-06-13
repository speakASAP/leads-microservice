# Goal 11 Chunk 11.2 - Lifecycle Event And API Contracts

```yaml
id: LEADS-GOAL-11-CHUNK-11-2-LIFECYCLE-CONTRACTS
status: accepted
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
  - ../BUSINESS.md
  - ../SYSTEM.md
downstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md
```

## Purpose

Define implementation-ready lifecycle event contracts and guarded API shapes before runtime source edits. These contracts make Leads the minimized warm-contact event and consent authority for non-registered contacts while keeping raw contact resolution, campaign execution, registered identity, notification delivery, CRM workflow, logging storage, and paid-customer facts in their owning services.

## Contract Versioning

All new lifecycle contracts use `contractVersion: "2026-06-13.lifecycle.v1"` until a later owner-approved migration changes the shape.

Compatibility rules:

- Additive optional fields are allowed only when they preserve minimization and do not reveal raw contact values, raw messages, confirmation tokens, private URL paths/queries, metadata values, secrets, or production lead rows.
- Renames, type changes, required-field additions, or relaxed consent checks require a new version and synthetic contract tests.
- Event consumers must treat unknown fields as non-authoritative and must not infer raw identity from source labels, source hosts, or metadata keys.
- Contract examples must use synthetic IDs and values only.

Common envelope for lifecycle events:

```ts
type LeadsLifecycleEventEnvelope<TType extends string, TPayload> = {
  contractVersion: '2026-06-13.lifecycle.v1';
  eventId: string;
  eventType: TType;
  occurredAt: string;
  producer: 'leads-microservice';
  leadId: string;
  idempotencyKey: string;
  payload: TPayload;
};
```

Envelope rules:

- `eventId` is a generated event identifier, not a lead/contact identifier.
- `occurredAt` is an ISO8601 timestamp produced by Leads at event creation time.
- `idempotencyKey` should be stable per lifecycle transition, for example `lead:{leadId}:submitted`, `lead:{leadId}:confirmed:{confirmedAt}`, or `lead:{leadId}:preferences:{updatedAt}`.
- Events are intended for future internal publication or service-to-service retrieval; no public unauthenticated event stream is approved by this contract.

## Source And Contact Summary Types

```ts
type LeadsSourceSummary = {
  sourceService: string;
  sourceLabel: string | null;
  sourceHost: string | null;
};

type LeadsContactSummary = {
  contactMethodTypes: Array<'email' | 'telegram' | 'whatsapp'>;
  contactMethodCount: number;
  primaryContactMethodType: 'email' | 'telegram' | 'whatsapp' | null;
};

type LeadsConsentSummary = {
  marketingConsent: boolean | null;
  consentEvidencePresent: boolean;
  consentCapturedAtPresent: boolean;
  unsubscribed: boolean;
};

type LeadsPreferenceSummary = {
  preferredChannel: string | null;
  fallbackChannelCount: number;
};
```

Source URL handling:

- Allowed default event/API value: `sourceHost` only.
- Forbidden default value: full `sourceUrl`, path, query string, fragment, private tenant/workspace slug, or campaign URL values.
- Product apps may send `sourceUrl` to Leads intake, but downstream lifecycle contracts expose only host by default.

Metadata handling:

- Allowed default event/API value: sorted metadata key names when explicitly needed for diagnostics.
- Forbidden default value: metadata values, arbitrary user text, private attribution IDs, raw UTM query values, or app-specific payloads that can identify a person.

## Lifecycle Events

### LeadSubmitted

Emitted or retrievable after a public lead submission is accepted.

```ts
type LeadSubmittedEvent = LeadsLifecycleEventEnvelope<'LeadSubmitted', {
  source: LeadsSourceSummary;
  contact: LeadsContactSummary;
  consent: LeadsConsentSummary;
  preference: LeadsPreferenceSummary;
  lifecycle: {
    status: 'new' | 'confirmed' | string;
    confirmed: boolean;
    createdAt: string;
  };
  messageLength: number;
  metadataKeys: string[];
}>;
```

Allowed by default:

- `leadId`, `sourceService`, `sourceLabel`, `sourceHost`.
- contact method types/count and primary type.
- message length only, never message text.
- metadata keys only, never metadata values.
- marketing-consent boolean and evidence-presence flags.
- confirmation/unsubscribe booleans and timestamps that describe lifecycle state.

Forbidden by default:

- contact method values.
- raw message.
- confirmation token.
- full source URL path/query/fragment.
- metadata values.
- raw submission payload JSON.

### LeadConfirmed

Emitted or retrievable after a confirmation token validates and the lead is marked confirmed.

```ts
type LeadConfirmedEvent = LeadsLifecycleEventEnvelope<'LeadConfirmed', {
  source: Pick<LeadsSourceSummary, 'sourceService' | 'sourceHost'>;
  confirmedAt: string;
  status: 'confirmed' | string;
}>;
```

Rules:

- The event must not include the confirmation token used to prove control.
- The current public confirmation response may remain user-facing, but ecosystem event consumers receive only minimized confirmation state.
- Repeated confirmation calls should not emit conflicting state; use the original `confirmedAt` when the lead was already confirmed.

### LeadPreferenceUpdated

Emitted or retrievable after trusted internal preference updates or unsubscribe changes.

```ts
type LeadPreferenceUpdatedEvent = LeadsLifecycleEventEnvelope<'LeadPreferenceUpdated', {
  consent: LeadsConsentSummary & {
    consentSourcePresent: boolean;
  };
  preference: LeadsPreferenceSummary;
  updatedAt: string;
}>;
```

Rules:

- `consentSourcePresent` may be exposed; the raw consent source text or version string is not exposed by default.
- `unsubscribed: true` must suppress campaign eligibility immediately.
- Preference updates do not prove contact ownership and must not be used for Auth linking by themselves.

### LeadConvertedToUser

Emitted or retrievable only after Auth verifies contact ownership or validates an explicit conversion token. Auth owns the registered user record and the verification policy.

```ts
type LeadConvertedToUserEvent = LeadsLifecycleEventEnvelope<'LeadConvertedToUser', {
  userId: string;
  linkedAt: string;
  linkMethod: 'auth_verified_contact' | 'conversion_token';
  source: Pick<LeadsSourceSummary, 'sourceService' | 'sourceHost'>;
}>;
```

Rules:

- Leads must not bulk-export raw contact values to Auth for identity inference.
- Auth may request a one-lead link operation only after it has verified contact ownership or presents a purpose-bound conversion token.
- The event references `leadId` and `userId`; it does not contain email, phone, Telegram, WhatsApp, password, session, or JWT data.

### LeadSuppressedOrUnsubscribed

Use this event when future implementation needs explicit suppression signals beyond the preference-updated event.

```ts
type LeadSuppressedOrUnsubscribedEvent = LeadsLifecycleEventEnvelope<'LeadSuppressedOrUnsubscribed', {
  reason: 'unsubscribe' | 'complaint' | 'bounce' | 'manual_suppression' | 'policy';
  sourceService: string | null;
  suppressedAt: string;
}>;
```

Rules:

- Notifications may feed bounce/complaint facts to Leads through a future guarded endpoint, but Notifications does not own audience decisions.
- Marketing must treat this event as exclusionary unless an owner-approved recovery policy says otherwise.

## Guarded API Shapes

No new runtime endpoint is implemented in chunk 11.2. These are implementation targets for later chunks.

### Product App Intake

Existing direction: `POST /api/leads/submit`.

Future request shape remains compatible with the existing DTO unless a later versioned intake endpoint is approved:

```ts
type LeadIntakeRequest = {
  sourceService: ProductSourceService;
  sourceLabel?: string;
  sourceUrl?: string;
  message: string;
  contactMethods: Array<{ type: 'email' | 'telegram' | 'whatsapp'; value: string }>;
  preferredChannel?: string;
  fallbackChannels?: string[];
  marketingConsent?: boolean;
  consentSource?: string;
  consentCapturedAt?: string;
  metadata?: Record<string, unknown>;
};
```

Response shape:

```ts
type LeadIntakeResponse = {
  leadId: string;
  status: string;
  confirmationSent: boolean;
};
```

Product apps must not log raw contact values or raw messages after submission. Validation must use synthetic contact values and must not create production leads unless explicitly approved.

### Lifecycle Event Retrieval

Proposed guarded endpoint:

`GET /api/leads/internal/:id/lifecycle-events`

Auth: trusted internal-service guard now; future Auth-backed service claims can replace or supplement it.

Response:

```ts
type LeadLifecycleEventsResponse = {
  leadId: string;
  contractVersion: '2026-06-13.lifecycle.v1';
  events: Array<LeadSubmittedEvent | LeadConfirmedEvent | LeadPreferenceUpdatedEvent | LeadConvertedToUserEvent | LeadSuppressedOrUnsubscribedEvent>;
};
```

Default consumers: CRM, Marketing, Auth, Logging analytics, and product apps with a justified service-to-service need. This endpoint must not expose raw contact values, raw messages, confirmation tokens, source path/query, or metadata values.

### Campaign Eligibility Preview

Proposed guarded endpoint:

`POST /api/leads/internal/campaign-eligibility/preview`

Request:

```ts
type CampaignEligibilityPreviewRequest = {
  leadIds: string[];
  campaignPurpose: 'marketing' | 'transactional' | 'lifecycle';
  channel: 'email' | 'telegram' | 'whatsapp';
  requireConfirmedContact?: boolean;
};
```

Response:

```ts
type CampaignEligibilityPreviewResponse = {
  contractVersion: '2026-06-13.lifecycle.v1';
  items: Array<{
    leadId: string;
    eligible: boolean;
    reasons: Array<
      | 'marketing_consent_true'
      | 'consent_source_present'
      | 'consent_captured_at_present'
      | 'not_unsubscribed'
      | 'confirmed_when_required'
      | 'supported_channel_present'
      | 'missing_marketing_consent'
      | 'missing_consent_source'
      | 'missing_consent_captured_at'
      | 'unsubscribed'
      | 'confirmation_required'
      | 'unsupported_channel'
    >;
    contactMethodTypes: Array<'email' | 'telegram' | 'whatsapp'>;
    preferredChannel: string | null;
  }>;
};
```

Eligibility rules:

- Marketing campaign eligibility requires `marketingConsent === true`.
- `consentSource` and `consentCapturedAt` must be present for affirmative marketing consent.
- `unsubscribedAt` must be absent.
- Confirmation is required when channel policy or campaign policy requests it.
- Human campaign approval must happen in Marketing/CRM before send execution.
- This preview returns lead IDs and eligibility reasons only; it does not return contact values.

### Controlled Contact Resolution

Proposed guarded endpoint:

`POST /api/leads/internal/contact-resolution`

Request:

```ts
type ContactResolutionRequest = {
  leadId: string;
  purpose: 'single_lead_human_review' | 'approved_campaign_send' | 'auth_conversion_link';
  approvalId?: string;
  requestedChannels?: Array<'email' | 'telegram' | 'whatsapp'>;
};
```

Response:

```ts
type ContactResolutionResponse = {
  leadId: string;
  purpose: ContactResolutionRequest['purpose'];
  resolvedAt: string;
  contactMethods: Array<{
    type: 'email' | 'telegram' | 'whatsapp';
    value: string;
    isPrimary: boolean;
  }>;
  consent: {
    marketingConsent: boolean | null;
    consentCapturedAtPresent: boolean;
    unsubscribed: boolean;
  };
};
```

Resolution rules:

- `single_lead_human_review` resolves one lead at a time for an authorized operator action.
- `approved_campaign_send` requires campaign approval evidence from Marketing/CRM and must re-check consent/unsubscribe immediately before resolving contact values.
- `auth_conversion_link` requires Auth verification or an explicit conversion token.
- Bulk raw export is not approved. Any batch resolution needs a separate owner-approved task naming exact fields, destination, retention, audit logging, and validation evidence.

### Auth Conversion Link

Proposed guarded endpoint:

`POST /api/leads/internal/:id/conversion-links`

Request:

```ts
type LeadConversionLinkRequest = {
  userId: string;
  linkMethod: 'auth_verified_contact' | 'conversion_token';
  verifiedAt: string;
};
```

Response:

```ts
type LeadConversionLinkResponse = {
  leadId: string;
  userId: string;
  linkedAt: string;
  linkMethod: 'auth_verified_contact' | 'conversion_token';
  event: LeadConvertedToUserEvent;
};
```

Rules:

- Auth owns user IDs, verification, JWTs, RBAC, and registered-user consent.
- Leads records only the link evidence needed for lifecycle traceability.
- No Auth endpoint may infer identity through raw lead bulk reads.

## Product Source Taxonomy

Initial allowed taxonomy for product app contracts:

```ts
type ProductSourceService =
  | 'shop-assistant'
  | 'buzzos'
  | 'flipflop'
  | 'speakup'
  | 'marathon'
  | 'statex'
  | 'sgiprealestate'
  | 'shared-landing'
  | 'unknown';
```

Taxonomy rules:

- Product apps should use a stable lowercase slug owned by the app team.
- `sourceLabel` may describe surface or campaign in human-readable form but must not carry contact values or private tenant identifiers.
- `metadata` may include safe attribution keys, but lifecycle consumers receive key names only by default.
- New app slugs should be added through synthetic contract tests before production cutover.

## Consumer Ownership Matrix

| Consumer | Allowed default data | Forbidden default data | Owner boundary |
| --- | --- | --- | --- |
| Auth | `leadId`, conversion event, source summary, link method | raw contact values for bulk inference, JWT/session data | Auth owns identity, verification, RBAC, registered consent |
| Marketing | eligibility preview, lead IDs, consent/preference state, contact method types | contact values before approval, campaign execution inside Leads | Marketing owns campaigns, segments, approval, throttling |
| Notifications | one approved delivery request from owner service | audience decisions, provider credentials in Leads | Notifications owns delivery mechanics and status |
| CRM | minimized lifecycle events, masked summaries, one-lead review context | raw bulk export, full submission payloads by default | CRM owns funnel workflow once created |
| Product apps | intake response, own source taxonomy, non-sensitive status where approved | other apps lead data, raw lifecycle stream | apps own capture surfaces and activation events |
| AI | minimized/redacted context only | raw contacts/messages unless task-approved | AI owns analysis, not lead storage |

## Validation Requirements For Future Runtime Implementation

Future source changes implementing these contracts must include:

- synthetic contract tests for event builders and API responses;
- tests proving forbidden fields are omitted from minimized responses;
- consent eligibility tests for missing consent, missing source, missing timestamp, unsubscribed, and confirmation-required cases;
- authorization tests for guarded internal endpoints;
- build validation;
- secret-pattern and missing-marker scans for docs and test fixtures;
- no production lead mutation unless explicitly approved.
