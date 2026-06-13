# Goal 14 - LeadConfirmed And LeadPreferenceUpdated Lifecycle Adoption

```yaml
id: GOAL-14-lead-confirmed-preference-lifecycle-adoption
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - ../implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md
  - ../implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.md
  - ../implementation-goals/GOAL-13-lead-submitted-lifecycle-adoption.md
downstream:
  - ../src/leads/leads.controller.ts
  - ../src/leads/leads.controller.spec.ts
```

## Intent

Adopt the next minimized lifecycle events in Leads runtime flows so confirmation, preference update, and unsubscribe state changes are observable by the ecosystem without exporting raw lead data or changing public API contracts.

## Scope

- Record a minimized `LeadConfirmed` lifecycle event after successful public confirmation.
- Record a minimized `LeadPreferenceUpdated` lifecycle event after internal preference updates.
- Record a minimized `LeadPreferenceUpdated` lifecycle event after internal unsubscribe.
- Add focused controller tests proving sensitive values remain out of lifecycle metadata.

## Out Of Scope

- No new route, DTO, Prisma schema, message bus, campaign execution, product-app change, Auth integration, AI enrichment, CRM export, production read, production mutation, deployment, or raw lead export.
- No change to confirmation response shape; the existing response may still include the confirmed email for compatibility, but lifecycle metadata must not.

## Acceptance Criteria

- Confirmation response shape is unchanged.
- Lifecycle logging omits contact values, confirmation tokens, private URL path/query values, and consent source values.
- Preference lifecycle payload includes only consent state summary, preference channel summary, fallback count, unsubscribe timestamp, and update timestamp.
- Unsubscribe is represented as a preference lifecycle change with `marketingConsent: false`.
- Focused Jest tests and build pass.
