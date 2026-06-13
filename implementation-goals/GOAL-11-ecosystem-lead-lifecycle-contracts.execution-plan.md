# Goal 11 Execution Plan - Ecosystem Lead Lifecycle Contracts

```yaml
id: LEADS-GOAL-11-EXECUTION-PLAN
status: active
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.context-package.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md
  - ../docs/orchestrator/PRE_CODING_GATE.md
downstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md
```

## Selected Chunk

Chunk 11.2 - Define implementation-ready lifecycle event contracts for lead submission, confirmation, preference updates, Auth conversion linkage, and campaign eligibility.

## Result

Chunk 11.2 is documentation-only and complete once validation passes. Chunk 11.3 is the next implementation step and must define Auth-backed tenant/admin access requirements before replacing the temporary internal-token admin shell.

## Intent And Boundary Impact

This chunk strengthens Leads as the consent-aware warm-contact ledger by defining minimized lifecycle event and guarded API contracts before runtime source changes. It explicitly keeps Auth, Marketing, Notifications, CRM, Billing, Logging, product apps, and AI inside their ownership boundaries.

## Invariant Review

- `LEADS-INV-001`: strengthened by specifying Leads-owned lifecycle events for non-registered lead submission, confirmation, preferences, unsubscribe/suppression, and conversion linkage evidence.
- `LEADS-INV-002`: strengthened by documenting consumer ownership boundaries for Auth, Marketing, Notifications, CRM, product apps, Billing, Logging, and AI.
- `LEADS-INV-003`: strengthened by making campaign eligibility depend on affirmative consent evidence and no unsubscribe state.
- `LEADS-INV-004`: strengthened by forbidding raw contact values, raw messages, confirmation tokens, private URL path/query, metadata values, and raw submission payloads from default lifecycle contracts.
- `LEADS-INV-005`: strengthened by requiring human Marketing/CRM approval before campaign send execution and separating eligibility preview from contact resolution.
- `LEADS-INV-006`: preserved; no public intake limit or timeout changes.
- `LEADS-INV-007`: preserved and clarified; proposed lifecycle, eligibility, contact-resolution, and conversion endpoints are guarded internal APIs.
- `LEADS-INV-008`: preserved; Notifications remains delivery owner and does not make audience decisions.
- `LEADS-INV-009`: strengthened; AI/CRM receive minimized lifecycle summaries by default, and raw export remains unapproved.
- `LEADS-INV-010`: satisfied by this execution pack, validation report, status update, and continuation state.

## Sensitive-Data Classification

`none`. The chunk defines schemas and rules only. It uses no raw production data, real contact details, confirmation tokens, private URLs, secrets, lead rows, raw messages, AI payloads, or CRM exports.

## Consent Impact

No runtime consent behavior changes. Future contract implementation must preserve the rule that marketing campaign eligibility requires `marketingConsent === true`, present `consentSource`, present `consentCapturedAt`, no `unsubscribedAt`, and confirmation where campaign/channel policy requires it.

## Contract/Schema Impact

No runtime API, Prisma schema, notification, logging, AI, CRM, or campaign contract changes are made in this chunk. Documentation defines future target shapes for:

- lifecycle events: `LeadSubmitted`, `LeadConfirmed`, `LeadPreferenceUpdated`, `LeadConvertedToUser`, and optional `LeadSuppressedOrUnsubscribed`;
- existing product app intake direction through `POST /api/leads/submit`;
- proposed guarded lifecycle event retrieval;
- proposed campaign eligibility preview;
- proposed controlled contact resolution;
- proposed Auth conversion link.

## Replay And Determinism Impact

No production mutation, lead creation, confirmation, unsubscribe, notification send, campaign send, contact resolution, Auth link, or data export is performed. Future event implementation must use deterministic idempotency keys per lifecycle transition.

## Files Modified In Chunk 11.2

- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/README.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.context-package.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.coding-prompt.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md`
- `TASKS.md`
- `STATE.json`

## Validation Commands

```bash
find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print
rg '\[(MISSING|UNKNOWN):' docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md
rg -n 'Authorization: Bearer [A-Za-z0-9_./+=:-]{12,}|(access[_-]?token|client[_-]?secret|password|private[_-]?key|confirmation[_-]?token)\s*[:=]\s*["'''"]?[A-Za-z0-9_./+=:-]{12,}' docs AGENTS.md TASKS.md implementation-goals
```

## Pre-Coding Gate

Gate result: pass for documentation-only contract definition. Runtime coding remains blocked until a future chunk defines exact source scope and validation commands for implementation.

## Chunk 11.3 Execution Addendum

Selected chunk: 11.3 - Define Auth-backed tenant and admin access requirements before replacing the temporary internal-token admin shell.

Files modified:

- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md`
- `TASKS.md`
- `STATE.json`

Contract impact: documentation-only. Defines future Auth-backed admin access but does not change runtime authentication, authorization, routes, schema, or frontend behavior.

Sensitive-data classification: none.

Consent impact: preserves consent evidence by requiring tenant-scoped, role-gated, masked admin access and audited contact reveal.

Outreach impact: no outreach automation; admin access does not grant campaign send execution.

Next chunk: 11.4 - Define Marketing campaign eligibility and human approval contract.

## Chunk 11.4 Execution Addendum

Selected chunk: 11.4 - Define Marketing campaign eligibility and human approval contract using Leads consent and unsubscribe state.

Files modified:

- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md`
- `TASKS.md`
- `STATE.json`

Contract impact: documentation-only. Defines future Marketing eligibility and approval contracts but does not change runtime APIs, schemas, events, or service calls.

Sensitive-data classification: none.

Consent impact: strengthens future eligibility by requiring affirmative consent evidence, no unsubscribe, and confirmation where policy requires it.

Outreach impact: no outreach automation; contract keeps campaign execution Marketing-owned and human-approved.

Next chunk: 11.5 - Define CRM service boundary, minimal schema, and safe read/reveal contracts.

## Chunk 11.5 Execution Addendum

Selected chunk: 11.5 - Define CRM service boundary, minimal schema, and safe read/reveal contracts before CRM runtime implementation.

Files modified:

- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.crm-boundary.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md`
- `TASKS.md`
- `STATE.json`

Contract impact: documentation-only. Defines future CRM service and Leads safe-read/reveal contracts but does not change runtime APIs, schemas, events, or service calls.

Sensitive-data classification: none.

Consent impact: preserves consent by requiring CRM to use minimized reads by default and purpose-bound contact reveal with consent/unsubscribe checks.

Outreach impact: no outreach automation; CRM may propose campaign membership but Marketing owns approval and execution.

Next chunk: 11.6 - Define product-app integration contract and source taxonomy.

## Chunk 11.6 Execution Addendum

Selected chunk: 11.6 - Define product-app integration contract and source taxonomy for Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, StateX, and future B2C apps.

Files modified:

- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.product-apps.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.execution-plan.md`
- `implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.validation-report.md`
- `TASKS.md`
- `STATE.json`

Contract impact: documentation-only. Defines future product-app integration contract and source taxonomy but does not change runtime APIs, schemas, events, service calls, or product apps.

Sensitive-data classification: none.

Consent impact: strengthens future app intake by requiring explicit consent evidence when marketing consent is true.

Outreach impact: no outreach automation; product app intake is not campaign permission.

Goal 11 result: complete. Next recommended implementation goal: add focused contract tests/builders for Leads lifecycle and product-app payload compatibility before runtime integration.
