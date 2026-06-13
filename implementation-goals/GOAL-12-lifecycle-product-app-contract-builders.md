# Goal 12 - Lifecycle And Product-App Contract Builders

```yaml
id: LEADS-GOAL-12-LIFECYCLE-PRODUCT-APP-CONTRACT-BUILDERS
status: done
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.product-apps.md
downstream:
  - GOAL-12-lifecycle-product-app-contract-builders.execution-plan.md
  - GOAL-12-lifecycle-product-app-contract-builders.context-package.md
  - GOAL-12-lifecycle-product-app-contract-builders.coding-prompt.md
  - GOAL-12-lifecycle-product-app-contract-builders.validation-report.md
```

## Intent

Add focused contract builders and tests for minimized Leads lifecycle events and product-app intake payload compatibility before runtime cross-service integration.

## Chunks

- [x] 12.1 Create goal-specific execution artifacts and pass the pre-coding gate.
- [x] 12.2 Add minimized lifecycle event builders and focused contract tests.
- [x] 12.3 Add product-app intake payload helpers, taxonomy constants, safe log summary, and focused contract tests.
- [x] 12.4 Validate focused tests, build, documentation scans, and sensitive-data handling.

## Scope

Allowed source files:

- `src/leads/integrations/lifecycle-events.ts`
- `src/leads/integrations/lifecycle-events.spec.ts`
- `src/leads/integrations/product-app-intake.ts`
- `src/leads/integrations/product-app-intake.spec.ts`

Allowed documentation/state files:

- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `implementation-goals/README.md`
- `implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.md`
- `implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.context-package.md`
- `implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.execution-plan.md`
- `implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.coding-prompt.md`
- `implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.validation-report.md`
- `TASKS.md`
- `STATE.json`

## Non-Goals

- No event emitter or message bus.
- No controller routes or public API changes.
- No Prisma schema or migration changes.
- No production lead read or mutation.
- No product-app repository edits.
- No raw export, campaign execution, notification send, AI enrichment, or CRM integration.
- No deployment.

## Acceptance Criteria

- Lifecycle event builders emit minimized payloads for `LeadSubmitted`, `LeadConfirmed`, `LeadPreferenceUpdated`, and `LeadConvertedToUser`.
- Lifecycle event tests prove contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, and consent source values are omitted.
- Product-app helpers define stable source taxonomy, source labels, metadata allowlist, canonical payload builder, and safe log summary.
- Product-app tests prove valid payloads pass `CreateLeadDto` validation and invalid source/label/metadata/contact behavior is rejected or sanitized.
- Focused tests and `npm run build` pass.
- Documentation scans pass with no missing markers or secret-pattern findings.
