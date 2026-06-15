# Goal 25 - Marketing Approval Evidence Handoff Contract: Context Package

```yaml
id: LEADS-GOAL-25-CONTEXT-PACKAGE
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: implementation-ready
upstream:
  - GOAL-25-marketing-approval-evidence-handoff-contract.execution-plan.md
downstream:
  - GOAL-25-marketing-approval-evidence-handoff-contract.coding-prompt.md
```

## Task Summary

Define and test the Marketing-owned human approval evidence handoff that Leads requires before resolving contact values for approved campaign sends. Leads accepts structured evidence by reference, builds audit-safe summaries, re-checks eligibility, and never stores campaign content or executes outreach.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/IMPLEMENTATION_ORCHESTRATOR.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/PLAN.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md`
- `implementation-goals/GOAL-16-marketing-campaign-eligibility-preview.md`
- `implementation-goals/GOAL-17-controlled-contact-resolution.md`

## Relevant Files

- `src/leads/dto/contact-resolution.dto.ts`
- `src/leads/leads.service.ts`
- `src/leads/leads.service.spec.ts`
- `src/leads/leads.controller.spec.ts`
- `src/leads/integrations/marketing-approval-evidence.ts`
- `src/leads/integrations/marketing-approval-evidence.spec.ts`

## Current Behavior

Goal 17 added guarded one-lead contact resolution. Approved campaign sends require an `approvalId` string and re-check campaign eligibility before returning contact values. The evidence object is not yet explicit about approver, approval timestamp, bounded purpose, campaign reference, retention expectation, or audit-safe summary rules.

## Required Behavior

Approved campaign contact resolution must require structured Marketing approval evidence, exactly one approved channel, and matching approval channel before returning contact values. The service must still re-check eligibility and must return/log only audit-safe approval summaries, not campaign content or contact values in summaries/logs.

## Constraints

- Marketing owns approval records, campaign content, audience decisions, execution jobs, and delivery outcomes.
- Leads owns consent, unsubscribe, confirmation, preferences, and guarded contact resolution.
- Notifications owns campaign delivery mechanics.
- No raw export, mass outreach, campaign execution, schema migration, production mutation, or deployment.
- No secrets, production rows, real contact values, raw messages, confirmation tokens, private URLs, metadata values, raw consent source values, JWTs, or campaign content in docs or validation output.

## Known Risks

- Runtime approval storage remains blocked until the owner explicitly chooses an owner. Mitigation: keep approval storage Marketing-owned and request-scoped in Leads.
- Tightening DTO shape may require Marketing adapter work. Mitigation: record contract explicitly and keep change limited to guarded internal contact resolution.
- DocsRAG retrieval returned HTTP 500. Mitigation: use repo-local source-of-truth contracts from Goals 11, 16, and 17.

## Validation Commands

- `npm test -- --runTestsByPath src/leads/integrations/marketing-approval-evidence.spec.ts src/leads/leads.service.spec.ts src/leads/leads.controller.spec.ts`
- `npm run build`
- missing-marker scan
- secret-pattern scan
