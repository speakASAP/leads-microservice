# Goal 3: Coding Prompt

```yaml
id: LEADS-GOAL-03-CODING-PROMPT
status: active
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete-for-implementation
upstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.context-package.md
  - GOAL-03-privacy-safe-retrieval-and-internal-access.execution-plan.md
downstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.validation-report.md
```

## Task Summary

Implement Goal 3: make raw lead retrieval privacy-safe through trusted internal access, preserve list bounds, and validate internal-service headers.

## Required Context

Read the selected goal, execution plan, context package, pre-coding gate, controller, service, query DTO, guard, and existing guard tests before source edits.

## Allowed Changes

- `src/leads/leads.controller.ts`
- `src/leads/leads.controller.spec.ts`
- `src/leads/leads.service.spec.ts`
- `src/leads/guards/internal-service.guard.spec.ts`
- Goal 3 validation/status/continuation docs listed in the execution plan.

## Forbidden Changes

- Do not export raw lead data.
- Do not trigger mass outreach.
- Do not weaken consent, confirmation, preference, or unsubscribe evidence.
- Do not alter Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.
- Do not print or persist secrets, real contact details, confirmation tokens, or raw production lead rows.
- Do not increase list limits or timeouts.
- Do not deploy without owner approval.

## Implementation Instructions

1. Run and record the pre-coding gate.
2. Stay inside the execution-plan scope.
3. Add `InternalServiceGuard` to raw lead list/detail retrieval.
4. Preserve public intake and confirmation routes.
5. Add focused tests for retrieval guards, existing internal route guards, list max-30 bounds, and missing trusted-service headers.
6. Run focused tests and build.
7. Update validation report, orchestrator status, and continuation state.

## Acceptance Criteria

- Raw lead retrieval is not public.
- Internal preference and unsubscribe APIs require the service guard.
- Pagination and bounds remain enforced at max 30 items.
- Trusted internal-service header validation has focused evidence.
- Focused tests and build pass.

## Validation Commands

- `npm test -- --runTestsByPath src/leads/leads.controller.spec.ts src/leads/leads.service.spec.ts src/leads/guards/internal-service.guard.spec.ts`
- `npm run build`
