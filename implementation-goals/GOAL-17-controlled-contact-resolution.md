# Goal 17 - Controlled Contact Resolution

```yaml
id: GOAL-17-controlled-contact-resolution
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - ../docs/orchestrator/GOALS.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md
  - GOAL-16-marketing-campaign-eligibility-preview.md
downstream:
  - ../src/leads/dto/contact-resolution.dto.ts
  - ../src/leads/leads.service.ts
  - ../src/leads/leads.controller.ts
```

## Intent

Add a guarded, bounded contact-resolution endpoint for one approved operational purpose at a time without creating a raw export surface or campaign execution path.

## Scope

- Add one-lead contact resolution DTO.
- Add service logic that resolves only requested channel values and re-checks eligibility for approved campaign sends.
- Add guarded internal endpoint with audit-safe logging.
- Add tests for approval requirements, eligibility re-checking, channel filtering, and sensitive logging.

## Out Of Scope

- No batch export, campaign send, Notifications dispatch, approval storage, tenant migration, Prisma schema change, AI/CRM export, production mutation, or deployment.
