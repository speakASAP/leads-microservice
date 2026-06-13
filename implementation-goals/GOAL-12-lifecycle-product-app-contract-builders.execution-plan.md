# Goal 12 Execution Plan - Lifecycle And Product-App Contract Builders

```yaml
id: LEADS-GOAL-12-EXECUTION-PLAN
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
```

## Selected Chunk

Goal 12 chunks 12.1 through 12.4.

## Intent And Boundary Impact

This goal implements local contract builders and tests that make Goal 11 contracts executable without adding cross-service runtime behavior. Leads remains the consent-aware non-registered lead intake service. Auth, Marketing, Notifications, CRM, Billing, Logging, and AI ownership boundaries are preserved.

## Invariant Review

- `LEADS-INV-001`: preserved; builders model Leads-owned intake and lifecycle evidence.
- `LEADS-INV-002`: preserved; no external ownership moves into Leads.
- `LEADS-INV-003`: strengthened; product-app builders require consent evidence when marketing consent is true.
- `LEADS-INV-004`: strengthened; lifecycle/log-summary builders omit raw sensitive values.
- `LEADS-INV-005`: preserved; no outreach automation.
- `LEADS-INV-006`: preserved; contact method bounds remain validated by DTO tests.
- `LEADS-INV-007`: not changed; no internal-service guard behavior changes.
- `LEADS-INV-008`: preserved; no notification delivery changes.
- `LEADS-INV-009`: preserved; no AI/CRM export.
- `LEADS-INV-010`: satisfied through validation and status updates.

## Sensitive-Data Classification

`synthetic`.

## Consent Impact

No runtime consent behavior changes. Product-app helper tests validate affirmative marketing consent includes source and captured timestamp.

## Contract/Schema Impact

No public API, internal API, Prisma schema, notification, logging, AI, CRM, Marketing, or Auth runtime contract changes. This adds local builders and tests.

## Replay And Determinism Impact

No production mutation, lead creation, confirmation, unsubscribe, notification send, campaign send, CRM export, or AI export is performed.

## Pre-Coding Gate

Gate result: pass. Exact source scope, non-goals, sensitive-data classification, validation commands, and ownership boundaries are defined before source edits.

## Validation Commands

```bash
npm test -- --runTestsByPath src/leads/integrations/lifecycle-events.spec.ts src/leads/integrations/product-app-intake.spec.ts
npm run build
rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md
rg -n -f /tmp/leads-secret-patterns.txt docs AGENTS.md TASKS.md implementation-goals src/leads/integrations
```
