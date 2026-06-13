# Goal 11 - Ecosystem Lead Lifecycle Contracts

```yaml
id: LEADS-GOAL-11-ECOSYSTEM-LEAD-LIFECYCLE-CONTRACTS
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
  - ../BUSINESS.md
  - ../SYSTEM.md
downstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.context-package.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.coding-prompt.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md
```

## Owner Request

Create a comprehensive ecosystem implementation plan so `leads-microservice` becomes the core warm-contact system across Marketing, Auth, Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, and other B2C applications. The final business goal is to move warm contacts toward registered paid customers while preserving consent, privacy, and service ownership boundaries.

## Core Decision

Leads is the canonical warm-contact and consent ledger for non-registered contacts. It must not become the full CRM, campaign engine, Auth identity service, notification sender, payment owner, logging store, or AI data-export service.

| Capability | Owner |
| --- | --- |
| Non-registered lead intake, source attribution, contact methods, submissions, consent evidence, confirmation, preferences, unsubscribe | `leads-microservice` |
| Registered users, JWTs, RBAC, organizations/workspaces, registered-user consent | `auth-microservice` |
| Campaign definitions, segments, audience approval, scheduling, throttling, campaign execution policy | `marketing-microservice` |
| Email, Telegram, WhatsApp, SMS delivery mechanics, templates, provider credentials, retries, delivery status | `notifications-microservice` |
| Funnel stages, tasks, notes, assignments, opportunities, campaign membership review, conversion workflow | future `crm-microservice` |
| Product-specific capture surfaces and activation events | Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, StateX, SGIP Real Estate, future B2C apps |
| Paid-customer facts, subscriptions, entitlements, invoices | Billing/orders/payment owner, not Leads |
| AI enrichment or prioritization | AI service, using minimized/redacted context only by default |

## Target Funnel

1. `anonymous_visitor`: arrives through a B2C app, landing page, ad, referral, QR code, waitlist, or product surface.
2. `warm_lead`: submits contact method, source, intent, channel preference, and consent context to Leads.
3. `confirmed_lead`: confirms contact when required; confirmation evidence stays in Leads.
4. `qualified_lead`: deterministic score and reasons identify readiness for review.
5. `human_reviewed_opportunity`: operator reviews the lead before CRM movement, contact reveal, enrichment, or campaign inclusion.
6. `registered_user`: Auth account is created or linked using verified contact ownership or explicit conversion token.
7. `activated_user`: product app reports first meaningful activation.
8. `paid_customer`: billing/payment owner reports paid conversion.
9. `closed_lost` or `suppressed_or_unsubscribed`: CRM/Leads records closure or suppression without campaign bypass.

## Product App Capture Contract

All B2C apps should submit through a shared Leads intake client using the existing public intake direction and future versioned contract.

Required or expected fields:

- `sourceService`: stable taxonomy value such as `shop-assistant`, `buzzos`, `flipflop`, `speakup`, `marathon`, `statex`, or `sgiprealestate`.
- `sourceLabel`: human-readable surface, feature, campaign, or product label.
- `sourceUrl`: sanitized URL where available. Private path/query values must not be copied into docs, logs, prompts, tests, or AI payloads.
- `contactMethods`: 1 to 30 methods using currently supported types `email`, `telegram`, or `whatsapp`.
- `message` or structured intent: bounded user-provided context.
- `preferredChannel` and `fallbackChannels`: channel preference when supplied.
- `marketingConsent`: explicit affirmative opt-in when true.
- `consentSource`: consent text/version/source when `marketingConsent` is true.
- `consentCapturedAt`: ISO timestamp when `marketingConsent` is true.
- `metadata`: safe attribution keys only; avoid arbitrary sensitive values.

Application capture examples:

| App | Capture points |
| --- | --- |
| Shop Assistant | notify me, abandoned product interest, quote request, shopping preference form, saved cart without login |
| Buzzos | waitlist, creator/business interest, early access, demo request |
| FlipFlop | product trial request, workflow template interest, support/contact form, feature waitlist |
| SpeakUp | speaking assessment request, lesson/demo booking, language-goal capture, course interest |
| Marathon | training plan signup, race goal capture, coaching interest, reminder opt-in |
| Shared landing pages | request access, pricing interest, book demo, newsletter opt-in, downloadable guide |

## Lifecycle Contracts To Define Next

Default lifecycle events must be minimized and safe for ecosystem consumption.

### `LeadSubmitted`

Allowed by default:

- `leadId`
- `sourceService`
- `sourceLabel`
- `sourceHost`
- `contactMethodTypes`
- `contactMethodCount`
- `marketingConsent`
- `consentEvidencePresent`
- `confirmed`
- `unsubscribed`
- `createdAt`

Forbidden by default:

- contact method values
- raw message
- confirmation token
- private URL path or query
- metadata values

### `LeadConfirmed`

Allowed by default:

- `leadId`
- `sourceService`
- `confirmedAt`

### `LeadPreferenceUpdated`

Allowed by default:

- `leadId`
- `marketingConsent`
- `preferredChannel`
- `fallbackChannelCount`
- `unsubscribedAt`
- `updatedAt`

### `LeadConvertedToUser`

Allowed by default after Auth verification:

- `leadId`
- `userId`
- `linkedAt`
- `linkMethod`
- `sourceService`

### Campaign Eligibility

Marketing should receive campaign-safe lead IDs and consent/preference state by default. Raw contact resolution should be separate, audited, bounded, and available only after campaign approval and consent checks.

Eligibility requires:

- `marketingConsent === true`
- present `consentSource`
- present valid `consentCapturedAt`
- no `unsubscribedAt`
- confirmation where the campaign or channel policy requires it
- human approval before send execution

## CRM Boundary

Near term, keep CRM-lite inside the existing Leads admin as an operator view only:

- masked lead list
- source filters
- consent health
- confirmation queue
- lifecycle status
- deterministic score and reasons
- one-lead-at-a-time review actions
- campaign eligibility preview

Create a separate `crm-microservice` when these runtime domains are needed:

- funnel definitions
- pipeline stages
- lead/contact profile references
- assignments
- tasks
- activities
- notes
- opportunities/deals
- campaign membership review
- conversion events
- tenant workspace dashboards
- cross-app reporting

CRM should reference `leadId` and fetch minimized or masked context by default. Raw contact reveal must be role-gated, purpose-bound, audited, and consent-aware.

## Auth And Tenancy Requirements

Auth must own:

- organizations/workspaces
- registered users
- RBAC roles
- JWT/session claims
- registered-user consent
- verified contact ownership

Leads admin should move away from browser-entered internal service tokens and toward Auth-backed operator sessions. Internal service tokens remain for service-to-service calls only.

Recommended roles:

- `owner`
- `admin`
- `sales_operator`
- `marketing_operator`
- `viewer`

Lead-to-user linking must use verified contact ownership or an explicit conversion token. Auth must not bulk-query raw lead data to infer identity.

## Marketing And Notifications Requirements

Marketing owns:

- campaign drafts
- segment definitions
- audience approval
- scheduling
- throttling/frequency policy
- campaign execution state

Marketing must query Leads for consent/preference eligibility and CRM for human-reviewed membership. Campaign execution must remain blocked until human approval is recorded.

Notifications owns:

- templates
- delivery channels
- provider credentials
- retries
- delivery status
- bounce/complaint events
- unsubscribe link delivery mechanics

Notifications should feed delivery, bounce, complaint, and unsubscribe signals back to Marketing and Leads without becoming the audience decision owner.

## Phased Implementation Roadmap

1. Deploy current Goal 10 frontend only after explicit owner approval.
2. Define implementation-ready lifecycle event and API contracts for Leads, Auth, Marketing, Notifications, CRM, and B2C apps. Completed in chunk 11.2 as documentation-only contract definition.
3. Add source app registry, idempotency keys, lifecycle statuses, masked summary endpoints, and deterministic scoring to Leads.
4. Add Auth-backed admin/tenant access design and then implementation.
5. Add Auth lead-to-user linking flow and conversion events.
6. Add Marketing campaign eligibility and approval workflow using Leads consent state and CRM membership.
7. Integrate Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, StateX, and future apps through a shared Leads intake client and synthetic contract tests.
8. Create `crm-microservice` once CRM workflow domains are stable enough to separate from Leads admin shell.
9. Add aggregate analytics for source performance, confirmation rate, consent health, funnel conversion, campaign ROI, time-to-first-follow-up, and app-to-paid-customer conversion.

## Chunk 11.2 Contract Decisions

Chunk 11.2 defines the implementation-ready contract version `2026-06-13.lifecycle.v1` in `GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md`. The approved runtime direction is:

- Lifecycle events use a shared envelope with `eventId`, `eventType`, `occurredAt`, `producer`, `leadId`, `idempotencyKey`, and minimized payload.
- Default events cover `LeadSubmitted`, `LeadConfirmed`, `LeadPreferenceUpdated`, `LeadConvertedToUser`, and optional `LeadSuppressedOrUnsubscribed`.
- Product app intake continues through the existing `POST /api/leads/submit` direction with source taxonomy and consent evidence requirements preserved.
- Future guarded APIs are planned for lifecycle event retrieval, campaign eligibility preview, controlled contact resolution, and Auth conversion linking.
- Campaign eligibility returns lead IDs, consent/preference state, contact method types, and deterministic reasons only; it never resolves raw contact values.
- Controlled contact resolution is separate, purpose-bound, one-lead or approval-scoped, and not approved for raw bulk export.
- Product source taxonomy starts with `shop-assistant`, `buzzos`, `flipflop`, `speakup`, `marathon`, `statex`, `sgiprealestate`, `shared-landing`, and `unknown`.

Runtime source edits remain for later chunks. Future implementation must add synthetic contract tests, omission tests for forbidden fields, guarded endpoint tests, consent eligibility tests, and build validation.

## Active Implementation Chunks

- Chunk 11.1 is complete as documentation and planning only.
- Chunk 11.2 is complete as implementation-ready contract documentation.
- Chunk 11.3 is next: define Auth-backed tenant and admin access requirements before replacing the temporary internal-token admin shell.

## Non-Goals

- No raw production lead export.
- No mass outreach.
- No campaign send execution.
- No AI raw-data enrichment.
- No payment or subscription ownership in Leads.
- No registered-user identity ownership in Leads.
- No deployment in this documentation chunk.

## Chunk 11.2 Contract Output

Lifecycle event contracts and API shapes are defined in `GOAL-11-ecosystem-lead-lifecycle-contracts.contracts.md`.

The contract document covers:

- shared minimized event envelope;
- `LeadSubmitted` v1;
- `LeadConfirmed` v1;
- `LeadPreferenceUpdated` v1;
- `LeadConvertedToUser` v1;
- Marketing campaign eligibility API;
- controlled contact resolution API;
- Auth lead-link API;
- product app intake source taxonomy;
- runtime implementation order and non-goals.

## Chunk 11.3 Auth Admin Access Output

Auth-backed tenant and admin access requirements are defined in `GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md`.

The contract document covers:

- Auth ownership boundary;
- required JWT/session claim semantics;
- Leads roles and permission matrix;
- tenant scoping requirements;
- browser admin access flow;
- separation between human admin APIs and service-to-service internal APIs;
- contact reveal request/approval contract;
- audit logging rules;
- error behavior;
- implementation order and non-goals.

## Chunk 11.4 Marketing Eligibility Output

Marketing campaign eligibility and human approval requirements are defined in `GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md`.

The contract document covers:

- Marketing/Leads/Auth/Notifications ownership boundaries;
- campaign lifecycle from draft to feedback;
- eligibility rules and ineligibility reason codes;
- eligibility request and response shapes;
- human approval record requirements;
- post-approval contact resolution rules;
- Notifications dispatch boundary;
- feedback event ownership;
- audit/logging rules;
- failure behavior;
- runtime implementation order and non-goals.

## Chunk 11.5 CRM Boundary Output

CRM service boundary, minimal schema, and safe read/reveal requirements are defined in `GOAL-11-ecosystem-lead-lifecycle-contracts.crm-boundary.md`.

The contract document covers:

- CRM versus Leads ownership boundary;
- creation criteria for a separate `crm-microservice`;
- minimal CRM schema for workflow references;
- safe CRM context read contract;
- one-lead-at-a-time safe reveal contract;
- CRM to Marketing handoff;
- CRM conversion references to Auth/Billing facts;
- audit requirements;
- failure behavior;
- runtime implementation order and non-goals.

## Chunk 11.6 Product App Integration Output

Product-app integration and source taxonomy requirements are defined in `GOAL-11-ecosystem-lead-lifecycle-contracts.product-apps.md`.

The contract document covers:

- product app responsibilities;
- public Leads intake endpoint use;
- canonical payload shape;
- stable `sourceService` taxonomy;
- `sourceLabel` taxonomy;
- approved metadata keys;
- app-specific capture points for Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, and StateX;
- consent UI requirements;
- frontend/backend logging rules;
- synthetic contract test requirements;
- shared client recommendation;
- implementation order and non-goals.
