# Leads Implementation Goals

```yaml
id: LEADS-IMPLEMENTATION-GOALS
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
downstream:
  - templates/
```

## Purpose

This directory stores durable goal records and goal-specific execution artifacts for `leads-microservice`.

## Current Goals

| Goal | Status | File |
| --- | --- | --- |
| Goal 1 - Intent Preservation System | done | `GOAL-01-intent-preservation-system.md` |
| Goal 2 - Lead Intake Contract And Consent Hardening | done | `GOAL-02-lead-intake-contract-and-consent-hardening.md` |
| Goal 3 - Privacy-Safe Retrieval And Internal Access | done | `GOAL-03-privacy-safe-retrieval-and-internal-access.md` |
| Goal 4 - Notification And Confirmation Reliability | done | `GOAL-04-notification-and-confirmation-reliability.md` |
| Goal 5 - AI And CRM Data-Sharing Boundary | done | `GOAL-05-ai-and-crm-data-sharing-boundary.md` |
| Goal 6 - Operational Smoke And Documentation Ingestion | done | `GOAL-06-operational-smoke-and-documentation-ingestion.md` |
| Goal 7 - Frontend Cutover Deployment Path Check | done | `GOAL-07-frontend-cutover-deployment-path.md` |
| Goal 8 - StateX Frontend Cutover To Leads Intake | done | `GOAL-08-statex-frontend-cutover-to-leads-intake.md` |
| Goal 9 - AI/CRM Payload Contract Tests | done | `GOAL-09-ai-crm-payload-contract-tests.md` |
| Goal 10 - Leads Frontend Landing And Admin Pages | done | `GOAL-10-leads-frontend-pages.md` |
| Goal 11 - Ecosystem Lead Lifecycle Contracts | done | `GOAL-11-ecosystem-lead-lifecycle-contracts.md` |
| Goal 12 - Lifecycle And Product-App Contract Builders | done | `GOAL-12-lifecycle-product-app-contract-builders.md` |
| Goal 13 - LeadSubmitted Lifecycle Event Adoption | done | `GOAL-13-lead-submitted-lifecycle-adoption.md` |
| Goal 14 - LeadConfirmed And LeadPreferenceUpdated Lifecycle Adoption | done | `GOAL-14-lead-confirmed-preference-lifecycle-adoption.md` |
| Goal 15 - Lifecycle Routing And Auth Conversion Linkage | done | `GOAL-15-lifecycle-routing-auth-conversion-linkage.md` |
| Goal 16 - Marketing Campaign Eligibility Preview | done | `GOAL-16-marketing-campaign-eligibility-preview.md` |
| Goal 17 - Controlled Contact Resolution | done | `GOAL-17-controlled-contact-resolution.md` |

## Required Artifacts For Future Coding

Before source edits for a selected goal, create or update:

- goal record: `GOAL-XX-name.md`;
- execution plan: `GOAL-XX-name.execution-plan.md`;
- context package: `GOAL-XX-name.context-package.md`;
- coding prompt: `GOAL-XX-name.coding-prompt.md`;
- validation report draft: `GOAL-XX-name.validation-report.md`.

No future coding task may start while execution-critical fields contain unresolved missing or unknown markers.

## Goal 11 Chunk 11.2 Artifact

- `GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md` defines versioned lifecycle events, guarded API target shapes, campaign eligibility preview, controlled contact resolution, Auth conversion linkage, and product source taxonomy.
