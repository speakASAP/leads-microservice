# Project Invariants: Leads Microservice

```yaml
id: PROJECT-INVARIANTS-leads-microservice
status: approved
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - BUSINESS.md
  - SYSTEM.md
  - docs/01_vision/VISION.md
downstream:
  - docs/01_vision/VISION.md
  - docs/12_validation/VAL-TASK-001-bootstrap-service.md
```

## purpose

These invariants protect leads-microservice's GDPR-compliant, human-gated intent and its Orders-event attribution correctness.

## applicability

These invariants apply to lead intake, AI integration, outreach logic, and the Orders order-created event consumer.

## invariants

- LEADS-INV-001: Lead data requires GDPR consent tracking.
- LEADS-INV-002: AI must never export raw lead data without explicit human approval.
- LEADS-INV-003: No mass outreach may occur without human review.
- LEADS-INV-004: Requests must not exceed 30 items; do not increase timeouts without checking logs first.
- LEADS-INV-005: The Orders order-created event consumer must not be broadened to full live consumption until a replay/backfill validation source is defined.

## exceptions

Exceptions to these invariants require explicit owner approval and must be documented in the affected task or validation record.

## review cadence

Review project invariants when entering a materially new scope, a deployment readiness gate, or a workflow change that affects operator trust or production safety.
