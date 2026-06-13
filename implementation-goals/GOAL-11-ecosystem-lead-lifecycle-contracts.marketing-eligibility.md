# Goal 11 Contracts - Marketing Campaign Eligibility And Human Approval

```yaml
id: LEADS-GOAL-11-MARKETING-ELIGIBILITY
status: approved
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - future source execution plans
```

## Purpose

Define how Marketing can use Leads consent, preference, confirmation, and unsubscribe evidence to build human-approved campaigns without turning Leads into a campaign execution service or raw lead export surface.

This is a contract artifact only. It does not change runtime behavior.

## Source Context

DocsRAG retrieval for Marketing/Leads contracts returned HTTP 200 from the in-cluster Leads runtime pod. The retrieved ecosystem context reinforced:

- `marketing-microservice` owns campaign orchestration, recipient decisions, execution jobs, and delivery outcomes.
- `leads-microservice` owns non-registered lead contact preferences and consent data.
- `auth-microservice` owns registered-user preferences and consent data.
- `notifications-microservice` owns channel registry and final provider dispatch.
- No direct database writes are allowed across service boundaries.

Token values were not printed.

## Ownership Boundary

| Capability | Owner |
| --- | --- |
| Lead consent, preference, confirmation, unsubscribe state | `leads-microservice` |
| Campaign drafts, segments, approval workflow, execution jobs, recipient decisions | `marketing-microservice` |
| Registered-user marketing preferences/consents | `auth-microservice` |
| Provider dispatch, channel registry, delivery retries, provider credentials | `notifications-microservice` |
| Human-reviewed funnel membership and opportunity context | future `crm-microservice` |
| Central logs and audit metadata storage | `logging-microservice` |

Leads must not own campaign scheduling, campaign send execution, campaign content rendering, delivery retries, provider credentials, or Marketing outcome analytics.

## Campaign Lifecycle

Recommended campaign lifecycle:

1. `draft`: Marketing creates campaign definition and purpose.
2. `audience_candidate`: Marketing or CRM proposes candidate lead IDs.
3. `eligibility_checked`: Marketing asks Leads for consent/preference eligibility.
4. `human_review_required`: human reviews audience, purpose, content, volume, and consent evidence.
5. `approved`: authorized reviewer approves campaign membership and send conditions.
6. `contact_resolution`: Marketing requests only required contact values from Leads for approved eligible lead IDs.
7. `dispatch_requested`: Marketing calls Notifications for approved recipients.
8. `delivery_outcome_recorded`: Notifications returns delivery outcomes to Marketing.
9. `preference_feedback_applied`: unsubscribe/complaint signals update Leads or Auth owner APIs.

Leads participates in steps 3, 6, and 9 only.

## Eligibility Rules

A non-registered lead is eligible only when all required rules pass:

- `marketingConsent === true`
- `consentSource` is present
- `consentCapturedAt` is present and valid
- `unsubscribedAt` is absent
- channel preference allows the requested channel or a fallback channel is allowed
- `confirmedAt` is present when campaign policy requires confirmed contact
- tenant/workspace scope matches the campaign owner once tenancy is implemented
- candidate lead is not suppressed by complaint, bounce, frequency-cap, or purpose-specific exclusion when those signals exist

Marketing must treat contact-method presence alone as insufficient permission.

## Ineligibility Reasons

Recommended reason codes:

- `missing_marketing_consent`
- `missing_consent_source`
- `missing_consent_captured_at`
- `unsubscribed`
- `confirmation_required`
- `channel_not_allowed`
- `tenant_scope_mismatch`
- `suppressed_complaint`
- `suppressed_bounce`
- `frequency_cap_exceeded`
- `invalid_lead_id`

Reason codes are safe to log because they do not include contact values or raw messages.

## Eligibility Request

Marketing should call Leads with candidate IDs and campaign policy.

```http
POST /api/leads/internal/campaign-eligibility
```

```json
{
  "campaignId": "campaign-id",
  "purpose": "product_nurture",
  "channel": "email",
  "leadIds": ["uuid"],
  "requireConfirmed": true,
  "requestedBy": "marketing-microservice",
  "workspaceId": "workspace-id"
}
```

Rules:

- `leadIds` should stay at or below the current Leads list bound of 30 unless a future owner-approved operational plan changes that limit.
- Request must be authenticated as a trusted internal service.
- Future tenant-aware implementation must validate `workspaceId` against Auth/CRM campaign ownership.
- Request must not include campaign content, raw contact values, raw messages, or arbitrary lead metadata.

## Eligibility Response

```json
{
  "campaignId": "campaign-id",
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
  ],
  "summary": {
    "requested": 1,
    "eligible": 1,
    "ineligible": 0
  }
}
```

Response must not include:

- contact method values
- raw messages
- confirmation tokens
- full source URLs
- private URL path/query values
- metadata values

## Human Approval Contract

Marketing owns approval records. CRM may propose or review membership once CRM exists. Leads should receive only approval references when contact resolution is requested.

Minimum approval record fields in Marketing:

```json
{
  "approvalId": "approval-id",
  "campaignId": "campaign-id",
  "approvedBy": "auth-user-id",
  "approvedAt": "2026-06-13T00:00:00.000Z",
  "workspaceId": "workspace-id",
  "purpose": "product_nurture",
  "channel": "email",
  "audienceCount": 25,
  "eligibleCount": 23,
  "ineligibleCount": 2,
  "contentVersion": "campaign-content-version",
  "approvalNotes": "human reviewed consent and audience"
}
```

Human approval must confirm:

- campaign purpose is lawful and matches consent source/purpose policy;
- audience was reviewed before send;
- ineligible leads are excluded;
- unsubscribe and complaint suppression are honored;
- send volume and frequency are acceptable;
- content version is approved;
- delivery channel is approved.

## Contact Resolution After Approval

Only after approval may Marketing request contact values for eligible leads.

```http
POST /api/leads/internal/contact-resolution
```

```json
{
  "campaignId": "campaign-id",
  "approvalId": "approval-id",
  "purpose": "product_nurture",
  "channel": "email",
  "leadIds": ["uuid"]
}
```

Rules:

- Leads must re-check eligibility before returning contact values.
- Leads must return only contact values required for the requested channel.
- Leads must audit request metadata without logging returned contact values.
- Contact resolution is not a general export.
- Batch size must remain bounded; default maximum should not exceed 30 without owner approval.
- Leads must not return raw messages, confirmation tokens, private URLs, or metadata values.

## Notifications Dispatch Boundary

Marketing calls Notifications after contact resolution and approval.

Notifications owns:

- provider dispatch;
- retries;
- provider credentials;
- delivery status;
- bounce/complaint signals;
- channel registry behavior.

Leads must not call Notifications for campaign sends. Leads may continue to request lead confirmation messages under the existing confirmation boundary.

## Feedback Events

Marketing and Notifications should feed non-sensitive outcomes back to the correct owner.

To Leads:

- unsubscribe from a non-registered lead;
- complaint signal tied to `leadId`;
- bounce/suppression signal tied to `leadId`;
- preference update request from a campaign flow.

To Marketing:

- delivery accepted/failed;
- opened/clicked when available and lawful;
- campaign-level outcome aggregates.

To Auth:

- registered-user unsubscribe/preference changes.

Feedback must not include raw lead messages, confirmation tokens, or unnecessary contact values.

## Audit And Logging

Allowed audit metadata:

- campaign ID;
- approval ID;
- lead ID;
- workspace ID;
- actor user ID or service name;
- purpose;
- channel;
- counts;
- reason codes;
- timestamps;
- result status.

Forbidden audit/log values:

- contact values;
- raw lead messages;
- confirmation tokens;
- full source URLs with private path/query;
- full JWTs or service tokens;
- arbitrary metadata values.

## Failure Behavior

Recommended behavior:

- Missing service authentication: reject with `401`.
- Untrusted service or tenant mismatch: reject with `403`.
- Invalid campaign purpose/channel: reject with `422`.
- Lead not visible to caller scope: return ineligible with `tenant_scope_mismatch` or omit based on future tenant policy.
- Approval missing or invalid during contact resolution: reject with `403`.
- Eligibility changed after approval: exclude lead and return a reason; do not return contact value.

## Runtime Implementation Order

1. Add focused tests for eligibility rules using synthetic leads.
2. Implement eligibility DTO and service with no contact values in response.
3. Add guarded internal eligibility endpoint.
4. Add audit-safe logging for eligibility requests and summaries.
5. Implement contact resolution only after approval/audit semantics are approved and tested.
6. Integrate Marketing with eligibility first, then contact resolution, then Notifications dispatch.
7. Add feedback handling for unsubscribe, complaint, bounce, and preference update signals.

## Non-Goals

- No runtime code change in this contract chunk.
- No campaign send execution in Leads.
- No raw lead export.
- No Marketing database writes from Leads.
- No Notifications provider dispatch from Leads campaigns.
- No production lead read or mutation validation.
- No token, contact value, raw message, or confirmation token in docs, logs, tests, prompts, or validation output.
