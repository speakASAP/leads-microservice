# Goal 25 - Marketing Approval Evidence Handoff Contract

```yaml
id: GOAL-25-marketing-approval-evidence-handoff-contract
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md
  - GOAL-16-marketing-campaign-eligibility-preview.md
  - GOAL-17-controlled-contact-resolution.md
downstream:
  - ../src/leads/integrations/marketing-approval-evidence.ts
  - ../src/leads/dto/contact-resolution.dto.ts
  - ../src/leads/leads.service.ts
```

## Intent

Specify how Marketing provides human approval evidence before Leads resolves contact values for campaign use, while Leads preserves affirmative consent evidence, unsubscribe state, bounded purpose, and no-mass-outreach boundaries.

## Contract

Marketing remains the approval storage owner. Leads receives a per-request approval evidence object as a handoff reference for contact resolution only; Leads does not persist campaign approval records or campaign content.

Minimum approval evidence fields:

- `approvalId`: Marketing-owned approval record reference.
- `campaignId`: Marketing-owned campaign reference.
- `approvedBy`: Auth user or service actor reference for the human approval.
- `approvedAt`: ISO8601 approval timestamp.
- `workspaceId`: workspace or tenant scope reference when known.
- `purposeCode`: bounded Marketing purpose code.
- `channel`: approved contact channel for this resolution request.
- `audienceCount`: reviewed audience size.
- `eligibleCount`: audience count that passed Leads eligibility.
- `contentVersion`: Marketing-owned campaign content version reference, not content body.
- `retentionExpectation`: Marketing-owned retention expectation for the approval record.

Bounded purpose codes:

- `product_nurture`
- `newsletter_opt_in`
- `event_follow_up`
- `lifecycle_follow_up`
- `customer_reactivation`

Retention expectations:

- `marketing_retains_until_campaign_audit_window_expires`
- `marketing_retains_until_consent_review_supersedes`

Leads must reject approved campaign contact resolution when approval evidence is missing, when the approval channel does not match the requested channel, or when multiple campaign-send channels are requested in one resolution call.

## Safety Rules

- Leads re-checks marketing eligibility immediately before returning any contact value.
- Marketing consent must be affirmative and backed by source plus timestamp evidence for marketing purpose.
- Unsubscribed leads must not return campaign contact values.
- Contact resolution returns only the requested approved channel values.
- Audit summaries may include approval/campaign IDs, purpose code, channel, counts, retention expectation, timestamps, and presence booleans.
- Audit summaries must not include contact values, campaign content, raw lead messages, confirmation tokens, private URLs, raw consent source values, or metadata values.

## Out Of Scope

- No campaign execution.
- No outbound send initiation.
- No Notifications dispatch.
- No batch raw contact export.
- No approval storage table in Leads.
- No Prisma schema or migration change.
- No production lead read or mutation validation.
- No deployment.

## 2026-06-15 Leads-Owned Storage Follow-Up

Owner decision: Leads may own a minimized approval-evidence reference store for contact-resolution audit evidence while Marketing remains the owner of approval records, campaign content, audience decisions, execution jobs, and delivery outcomes.

Storage slice:

- Dedicated `LeadMarketingApprovalEvidence` table related to one `Lead`.
- Stores only Marketing reference IDs (`approvalId`, `campaignId`), approval timestamp, bounded purpose code, channel, counts, retention expectation, presence booleans, eligibility result/reasons, returned contact-method count, idempotency key, and record timestamp.
- Does not store contact values, campaign content, raw messages, confirmation tokens, raw consent source values, metadata values, approver value, workspace value, or content-version value.
- Writes only after structured approval evidence passes validation and eligibility is re-checked.
- Records eligible and ineligible contact-resolution outcomes, but does not write rejected malformed/missing/mismatched approval evidence.
- Uses idempotent upsert keyed by lead, approval, campaign, channel, and approval timestamp.

The original no-storage non-goal above is superseded only for this minimized Leads-owned evidence slice. Campaign execution, outbound sends, Notifications dispatch, raw batch export, production mutation validation, and deployment remain out of scope.
