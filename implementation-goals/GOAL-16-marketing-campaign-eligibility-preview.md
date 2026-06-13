# Goal 16 - Marketing Campaign Eligibility Preview

```yaml
id: GOAL-16-marketing-campaign-eligibility-preview
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md
downstream:
  - ../src/leads/dto/campaign-eligibility-preview.dto.ts
  - ../src/leads/leads.service.ts
  - ../src/leads/leads.controller.ts
```

## Intent

Add a guarded Marketing eligibility preview API that evaluates candidate lead IDs against Leads-owned consent, unsubscribe, confirmation, preference, and contact-method evidence without exposing raw contact values or executing campaigns.

## Scope

- Add DTO for internal campaign eligibility preview requests.
- Add service logic for deterministic eligibility reason codes.
- Add guarded controller endpoint for `POST /leads/internal/campaign-eligibility/preview`.
- Add audit-safe logging summary.
- Add focused tests for eligibility, guard presence, and sensitive-data omission.

## Out Of Scope

- No campaign execution, scheduling, message rendering, Notifications dispatch, contact resolution, raw export, approval workflow, tenant migration, Prisma schema change, AI/CRM export, production mutation, or deployment.

## RAG Limitation

DocsRAG was queried first per project workflow, but `JWT_TOKEN` was unavailable in the remote shell. Implementation uses repo-local Goal 11 contracts as source of truth.
