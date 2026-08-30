# Vision: Leads Microservice

> Protected intent baseline. Human approval is required before changes to the approved project direction.

```yaml
id: VISION-leads-microservice
status: approved
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - ../00_constitution/CONSTITUTION.md
downstream:
  - ../../BUSINESS.md
  - ../17_governance/PROJECT_INVARIANTS.md
  - ../22_goal_impact/GOAL-IMPACT-TASK-001.md
```

## one-sentence vision

Capture and attribute leads without registration friction, while keeping GDPR consent and human-gated AI export non-negotiable.

## problem statement

Businesses lose leads when contact capture requires registration, and risk GDPR/trust violations when AI-driven analysis or outreach happens without consent tracking or human review. leads-microservice removes that friction while keeping consent and human oversight mandatory, and durably attributes leads to downstream Orders events.

## target users

- sgiprealestate, statex, and marketing-microservice as integration consumers
- Business operators following up on submitted leads
- Marketing teams running eligibility-gated campaigns

## core user need

Businesses need frictionless, GDPR-compliant lead capture with reliable CRM/AI integration and accurate order attribution, without risking uncontrolled AI data export or mass outreach.

## key outcomes

- Lead capture without registration
- GDPR consent tracked per lead
- AI export and mass outreach remain human-gated
- Orders order-created events reliably attributed to leads once replay/backfill validation is complete

## non-goals

- Order processing, payment capture, or catalog ownership
- Unsupervised AI-driven raw lead data export
- Unsupervised mass outreach campaigns

## success criteria

- GDPR consent tracking verified for every lead record
- CRM/AI integration succeeds within documented rate/size limits (max 30 items per request)
- Orders order-created event consumer passes its contract guard tests

## approval

Status: approved
Approved by: project owner
Approval evidence: owner-confirmation: leads-microservice-onboarding-approved
