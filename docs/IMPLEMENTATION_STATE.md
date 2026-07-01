# Leads Implementation State

```yaml
id: LEADS-IMPLEMENTATION-STATE
status: active
owner: leads-owner
created: 2026-06-12
last_updated: 2026-07-01
completeness_level: complete
upstream:
  - ../BUSINESS.md
  - ../SYSTEM.md
  - orchestrator/GOALS.md
downstream:
  - orchestrator/STATUS.md
  - ../TASKS.md
  - ../STATE.json
```

## Current State

- Stage: production.
- Health: `ok` after Goal 28 deployment of accumulated Goal 23-26 changes.
- Current owner-selected task: Orders production rollout Goal 7.4 Leads lane has contract guard/tests complete; runtime consumer is blocked.
- Runtime source changes in the latest completed deployed runtime task: Goal 24 FlipFlop lifecycle replay route, Goal 25 minimized marketing approval evidence storage, and Goal 26 Leads-side product-app intake matrix evidence.
- Latest implementation change: Goal 29 Orders event consumer contract guard and tests added; no deployment.
- Deployment: completed after owner approval. Image tag `goal24-26-integration-20260615` was built and pushed with digest `sha256:0134667f366f105cd7ec4651bf8f5823ab047508758678b3f29cc0f8b37bd204`; forced rollout restart pulled the new digest, Goal 25 migration applied successfully, health passed, unauthenticated admin returned 401, and admin page returned 200.

## Preserved Intent Summary

Leads is the consent-aware intake service for non-registered contact submissions. It must preserve contact, source, message, consent, confirmation, preference, and unsubscribe evidence while avoiding raw lead data export, mass outreach without human review, and ownership drift into Auth, Notifications, Marketing, Logging, database infrastructure, or AI model ownership.

## Active Goal

No runtime goal is active. Goal 24/25/26 integration was validated and deployed on 2026-06-15 after owner approval.

## Completed Goals

- Goal 1 - Intent Preservation System: complete on 2026-06-12.
- Goal 2 chunk 2.1 - Lead Intake Validation: complete on 2026-06-12.
- Goal 2 chunk 2.2 - Consent Evidence Requirements: complete on 2026-06-12.
- Goal 2 chunk 2.3 - Focused Validation Coverage: complete on 2026-06-12.
- Goal 2 chunk 2.4 - Consumer Compatibility Risks: complete on 2026-06-12.
- Goal 3 - Privacy-Safe Retrieval And Internal Access: complete on 2026-06-12.
- Goal 4 - Notification And Confirmation Reliability: complete on 2026-06-13.
- Goal 5 - AI And CRM Data-Sharing Boundary: complete on 2026-06-13.
- Goal 6 - Operational Smoke And Documentation Ingestion: complete on 2026-06-13.
- Goal 7 - Frontend Cutover Deployment Path Check: complete on 2026-06-13.
- Goal 10 - Leads Frontend Landing And Admin Pages: complete and deployed on 2026-06-13.
- Goal 11 chunk 11.1 - Ecosystem Lead Lifecycle Contracts Documentation: complete on 2026-06-13.
- Goal 11 chunk 11.2 - Ecosystem Lead Lifecycle Event And API Contracts: complete on 2026-06-13.
- Goal 11 chunk 11.3 - Auth-Backed Tenant And Admin Access: complete on 2026-06-13.
- Goal 11 chunk 11.4 - Marketing Campaign Eligibility And Human Approval: complete on 2026-06-13.
- Goal 11 chunk 11.5 - CRM Boundary Minimal Schema And Safe Read/Reveal: complete on 2026-06-13.
- Goal 11 chunk 11.6 - Product App Integration And Source Taxonomy: complete on 2026-06-13.
- Goal 12 - Lifecycle And Product-App Contract Builders: complete on 2026-06-13.
- Goal 13 - LeadSubmitted Lifecycle Event Adoption: complete on 2026-06-13.
- Goal 14 - LeadConfirmed And LeadPreferenceUpdated Lifecycle Adoption: complete on 2026-06-13.
- Goal 15 - Lifecycle Routing And Auth Conversion Linkage: complete on 2026-06-13.
- Goal 16 - Marketing Campaign Eligibility Preview: complete on 2026-06-13.
- Goal 17 - Controlled Contact Resolution: complete on 2026-06-13.
- Goal 18 - Durable Lifecycle Event Storage: complete on 2026-06-13.
- Goal 19 - Auth-Backed Admin API Authentication: complete and deployed on 2026-06-13.
- Goal 20 - Auth Workspace-Scoped Admin Isolation: complete and deployed on 2026-06-13.
- Goal 21 - Sanitized AI/CRM Context API: complete and deployed on 2026-06-13.
- Goal 22 - Production Auth Workspace Token Matrix Validation: complete on 2026-06-15.
- Goal 23 - Admin UI Scope Messaging And Empty-State Hardening: complete on 2026-06-13.
- Goal 24 - Internal Lifecycle Event Replay Consumer Contract: complete for docs/builders/tests on 2026-06-13; FlipFlop runtime replay path integrated and validated on 2026-06-15.
- Goal 26 - Product-App Intake Compatibility Matrix: complete for Leads-side synthetic matrix on 2026-06-13.
- Goal 27 - Documentation Ingestion And Orchestrator Freshness: complete on 2026-06-13.
- Goal 28 - Parallel Integration Validation And Deployment Readiness: complete and deployed on 2026-06-13.
- Goal 29 - Orders Event Consumer Contract For Leads: contract guard/tests complete on 2026-07-01; runtime consumer blocked by missing Orders attribution and Leads broker runtime contracts.

## Next Recommended Goal

Next recommended action: resolve Goal 29 blockers before runtime Orders event consumption: Orders must provide an approved lead attribution key or companion attribution contract, and Leads must define broker queue/retry/DLQ/runtime env conventions.

## Known Blockers

- Campaign execution, mass outreach, raw lead export, AI enrichment, notification dispatch, and production lead mutation remain forbidden unless a future owner-approved task defines exact scope and validation evidence.
- `[MISSING: Orders order-created event lead attribution field]`
- `[MISSING: Leads RabbitMQ consumer runtime convention for orders.events queue name, env vars, retry/backoff, and DLQ handling]`
- `[MISSING: replay/backfill validation source for missed Orders events]`

## Continuation Instructions

1. Re-read `docs/orchestrator/STATUS.md`.
2. Use the parallel execution board in `docs/orchestrator/PLAN.md`; Goal 29 runtime Orders consumption is blocked until attribution and broker contracts are resolved.
3. Preserve service boundaries: Leads owns non-registered intake/consent/preferences/unsubscribe; Auth owns identity/RBAC/tenancy; Marketing owns campaigns; Notifications owns delivery; CRM owns funnel workflow once implemented.
4. Do not implement raw lead export, mass outreach, campaign execution, AI enrichment, or production lead mutation without explicit owner approval and validation evidence.
5. Record validation and continuation evidence before ending.
