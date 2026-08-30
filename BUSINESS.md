# Business: Leads Microservice

> Protected business baseline. Human approval is required before changes to the approved product scope.

```yaml
id: BUSINESS-leads-microservice
status: approved
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - docs/01_vision/VISION.md
  - docs/00_constitution/CONSTITUTION.md
downstream:
  - SYSTEM.md
  - docs/22_goal_impact/GOAL-IMPACT-TASK-001.md
```

## problem

Businesses need to capture inbound contact/lead submissions without forcing registration, track GDPR consent, and route qualified leads to CRM/AI analysis and marketing follow-up, while strictly controlling when AI-derived insights are exported or acted on.

## target users and stakeholders

- sgiprealestate, statex, and marketing-microservice as documented consumers
- Business operators reviewing and following up on submitted leads
- Marketing campaigns using eligibility-preview and lifecycle routing

## value proposition

leads-microservice removes registration friction for lead capture while enforcing GDPR consent tracking and strict human-review gates before any AI-driven mass outreach or raw-data export, and now attributes leads to downstream Orders events via a durable RabbitMQ consumer.

## goals

- Provide lead intake and follow-up without requiring registration
- Integrate submitted leads with CRM and AI analysis
- Track GDPR consent per lead
- Attribute leads to Orders-domain events via a durable, contract-guarded RabbitMQ consumer
- Support marketing campaign eligibility preview and lifecycle routing

## non-goals

- Exporting raw lead data via AI without explicit human approval
- Performing mass outreach without human review
- Owning order processing, payment, or catalog domain data

## success metrics

- GDPR consent correctly tracked for every lead
- Lead-to-CRM/AI integration success rate
- Correct Orders-created event attribution once replay/backfill validation is complete

## business constraints

- GDPR: lead data requires consent tracking
- AI must never export raw lead data without explicit approval
- No mass outreach without human review
- Consumers: sgiprealestate, statex, marketing-microservice

## approval

Status: approved
Approved by: project owner
Approval evidence: owner-confirmation: leads-microservice-onboarding-approved
