# Goal 11 Contracts - Product App Integration And Source Taxonomy

```yaml
id: LEADS-GOAL-11-PRODUCT-APP-INTEGRATION
status: approved
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.crm-boundary.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - future product-app integration execution plans
  - future shared Leads client execution plans
```

## Purpose

Define how B2C product applications submit warm contacts to Leads with stable source taxonomy, consent evidence, safe attribution, and compatibility tests.

This is a contract artifact only. It does not modify any product application or Leads runtime behavior.

## Source Context

DocsRAG retrieval for product-app Leads intake returned HTTP 200 from the in-cluster Leads runtime pod. Retrieved context reinforced:

- Leads is the consent-aware intake service for non-registered contact submissions.
- Leads must preserve contact, source, message, consent, confirmation, preference, and unsubscribe evidence.
- Public intake remains separate from guarded internal retrieval.
- GDPR consent is tracked per lead.
- Lead preference and consent fields include `preferredChannel`, `fallbackChannels`, `marketingConsent`, `consentSource`, `consentCapturedAt`, and `unsubscribedAt`.
- Raw lead export, mass outreach without human review, and ownership drift are forbidden.

Token values were not printed.

## Product App Responsibility

Each product app owns its UI capture surface and local user intent context. Leads owns the non-registered lead record after submission.

Product apps must:

- submit warm-contact forms to Leads instead of ad hoc notification endpoints;
- provide stable `sourceService` and `sourceLabel`;
- collect and send consent evidence when marketing consent is true;
- avoid logging raw contact values and raw messages;
- avoid storing confirmation tokens or internal service tokens in browser code;
- use synthetic contract tests for payload compatibility;
- treat successful lead submission as intake only, not campaign permission.

## Required Intake Endpoint

Use public Leads intake:

```http
POST /api/leads/submit
```

Current production base URL:

```text
https://leads.alfares.cz
```

Product apps should use environment configuration for the base URL and must not hardcode internal Kubernetes URLs in browser code.

## Canonical Payload Shape

```json
{
  "sourceService": "shop-assistant",
  "sourceLabel": "pricing-interest",
  "sourceUrl": "https://example.com/pricing",
  "message": "I want to be notified when this is available.",
  "contactMethods": [
    {
      "type": "email",
      "value": "synthetic@example.com"
    }
  ],
  "preferredChannel": "email",
  "fallbackChannels": ["telegram"],
  "marketingConsent": true,
  "consentSource": "shop-assistant-pricing-form:v1",
  "consentCapturedAt": "2026-06-13T00:00:00.000Z",
  "metadata": {
    "intent": "pricing_interest",
    "surface": "pricing_page"
  }
}
```

Rules:

- `contactMethods` must contain 1 to 30 supported methods.
- Supported contact method types are `email`, `telegram`, and `whatsapp`.
- `marketingConsent: true` requires non-empty `consentSource` and valid ISO `consentCapturedAt`.
- Missing or false marketing consent means no affirmative marketing opt-in.
- `metadata` must use approved keys and must not become a free-form sensitive dump.
- Product apps must not send secrets, internal tokens, payment card data, passwords, or authentication credentials.

## Source Service Taxonomy

Initial approved `sourceService` values:

| sourceService | App |
| --- | --- |
| `shop-assistant` | Shop Assistant |
| `buzzos` | Buzzos |
| `flipflop` | FlipFlop |
| `speakup` | SpeakUp |
| `marathon` | Marathon |
| `statex` | StateX |
| `sgiprealestate` | SGIP Real Estate |
| `leads-landing` | Leads product landing page |
| `shared-landing` | Shared/cross-product landing pages |

Rules:

- Use lowercase kebab-case.
- Do not include tenant names, user IDs, email domains, campaign secrets, or personal data in `sourceService`.
- New values require documentation before production use.

## Source Label Taxonomy

Recommended `sourceLabel` values:

| sourceLabel | Meaning |
| --- | --- |
| `request-access` | User requests access to a product or feature. |
| `book-demo` | User asks for a demo or sales conversation. |
| `pricing-interest` | User requests pricing or offer information. |
| `waitlist` | User joins a waitlist. |
| `trial-request` | User asks for a trial. |
| `feature-interest` | User requests notification about a feature. |
| `abandoned-intent` | User shows intent but does not register or complete flow. |
| `newsletter` | User opts into updates/newsletter. |
| `support-contact` | User asks for help before registration. |
| `lead-magnet` | User requests downloadable/result content. |

Rules:

- Keep labels stable and analytics-friendly.
- Do not include raw user text in `sourceLabel`.
- Use `metadata.intent` for product-specific structured intent.

## Approved Metadata Keys

Allowed default keys:

- `intent`
- `surface`
- `campaignKey`
- `utmSource`
- `utmMedium`
- `utmCampaign`
- `referrerHost`
- `locale`
- `productKey`
- `featureKey`
- `variantKey`

Forbidden metadata values:

- passwords;
- access tokens;
- payment card data;
- raw contact values duplicated outside `contactMethods`;
- full private URLs with path/query when sensitive;
- raw user profile data;
- health, financial, or other special-category personal data unless owner-approved for the exact product flow.

## Application Capture Points

### Shop Assistant

Recommended capture points:

- notify me about product availability;
- abandoned product or saved cart without login;
- quote request;
- shopping preference form;
- request for personalized buying help.

Recommended labels:

- `pricing-interest`
- `feature-interest`
- `abandoned-intent`
- `request-access`

### Buzzos

Recommended capture points:

- waitlist;
- creator/business interest;
- early-access signup;
- demo request.

Recommended labels:

- `waitlist`
- `book-demo`
- `request-access`

### FlipFlop

Recommended capture points:

- product trial request;
- workflow template interest;
- feature waitlist;
- support/contact before registration.

Recommended labels:

- `trial-request`
- `feature-interest`
- `support-contact`

### SpeakUp

Recommended capture points:

- speaking assessment request;
- lesson/demo booking;
- language-goal capture;
- course interest.

Recommended labels:

- `book-demo`
- `lead-magnet`
- `pricing-interest`

### Marathon

Recommended capture points:

- training plan signup;
- race goal capture;
- coaching interest;
- progress reminder opt-in.

Recommended labels:

- `lead-magnet`
- `book-demo`
- `newsletter`

### StateX

Recommended capture points:

- direct contact/prototype forms;
- product interest;
- demo or consulting request;
- shared StateX landing pages.

Recommended labels:

- `request-access`
- `book-demo`
- `pricing-interest`

## Consent UI Requirements

When product apps ask for marketing consent:

- consent checkbox must be explicit and not preselected;
- consent text/version must map to `consentSource`;
- captured timestamp must map to `consentCapturedAt`;
- consent purpose must be understandable to the user;
- submission must still be possible without marketing consent where the business flow allows contact for transactional/manual follow-up;
- unsubscribe/preference links in follow-up flows must update Leads or Auth owner APIs.

## Frontend And Backend Logging Rules

Product apps must not log:

- contact method values;
- raw lead messages;
- full request payloads;
- confirmation tokens;
- service tokens;
- private source URLs;
- secrets or authentication credentials.

Allowed logs:

- source service;
- source label;
- metadata keys;
- contact method count;
- contact method types;
- message length;
- consent booleans;
- HTTP status;
- generated lead ID when returned.

## Contract Test Requirements

Each app integration should include synthetic tests for:

- valid minimal payload;
- valid marketing consent with `consentSource` and `consentCapturedAt`;
- no marketing consent compatibility;
- invalid contact method type rejected;
- empty contact methods rejected;
- oversized contact methods rejected;
- raw contact/message values not logged;
- environment base URL used instead of hardcoded internal service URL.

Tests must use synthetic data only.

## Shared Client Recommendation

Create a small shared Leads intake client only after the contract is stable.

Client responsibilities:

- build canonical payload;
- normalize `sourceService` and `sourceLabel`;
- enforce supported contact method types;
- attach consent source and timestamp when consent is true;
- redact/summarize logs;
- return lead ID/status/confirmationSent to the app.

Client non-goals:

- no internal-service token;
- no guarded list/detail retrieval;
- no campaign eligibility;
- no contact resolution;
- no CRM workflow;
- no Auth identity linking.

## Implementation Order

1. Add product-app contract tests in Leads using synthetic examples.
2. Add shared integration examples or SDK after contract tests.
3. Integrate one app at a time, starting with the highest-value active product surface.
4. Validate each app build/test without production lead mutation.
5. Use synthetic or staging intake checks only when explicitly approved.
6. Record source taxonomy additions before production use.

## Non-Goals

- No runtime code change in this contract chunk.
- No direct edits to product apps in this chunk.
- No production lead mutation validation.
- No raw lead export.
- No mass outreach.
- No campaign execution.
- No internal-service token in browser code.
- No secrets, real contacts, raw messages, or confirmation tokens in docs, logs, tests, prompts, or validation output.
