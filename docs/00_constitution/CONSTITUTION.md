# Project Constitution: Leads Microservice

> Protected document. Human approval is required. AI agents may draft only from approved source material and must not override the approved baseline without explicit approval.

```yaml
id: CONSTITUTION-leads-microservice
status: approved
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
[]
downstream:
  - ../01_vision/VISION.md
  - ../17_governance/PROJECT_INVARIANTS.md
```

## purpose

This constitution protects leads-microservice's intent: registration-free, GDPR-compliant lead intake with strictly human-gated AI export and outreach, and durable Orders-event attribution.

## constitutional principles

### intent preservation
Every implementation artifact must trace back to this approved project intent.

### human-controlled change
Approval gates and scope boundaries are not optional. Changes to ownership, scope, or production deployment policy require human approval.

### scope boundaries
leads-microservice remains a lead intake and attribution service; it does not process orders, payments, or catalog data, and never exports raw lead data or performs mass outreach without explicit human review.

### data and security
- Secrets, tokens, credentials, and private evidence must never be committed or exposed in logs or docs.
- Execution evidence must be grounded in actual data and validation results.
- Unverified automation must be treated as blocked or draft until evidence exists.

### validation
No task is complete without evidence against acceptance criteria and the approved project goals.

## amendment process

1. Create or update a proposal under `docs/17_governance/` or a reviewed equivalent path.
2. Explain the reason, affected artifacts, and compatibility impact.
3. Obtain human approval.
4. Update dependent documents and rerun relevant validation.

## approval

Status: approved
Approved by: project owner
Approval evidence: owner-confirmation: leads-microservice-onboarding-approved
