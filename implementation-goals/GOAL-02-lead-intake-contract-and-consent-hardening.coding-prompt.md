# Goal 2: Coding Prompt

```yaml
id: LEADS-GOAL-02-CODING-PROMPT
status: active
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete-for-chunk-2.4
upstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.context-package.md
  - GOAL-02-lead-intake-contract-and-consent-hardening.execution-plan.md
downstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.validation-report.md
```

## Task Summary

Implement chunk 2.4 of Goal 2: record consumer compatibility risks for sgiprealestate, statex, and marketing-microservice.

## Required Context

Read the selected goal, execution plan, context package, pre-coding gate, DTO, controller, consumer list, and DocsRAG consumer context before documentation edits.

## Allowed Changes

- Goal 2 validation/status/continuation docs listed in the execution plan.

## Forbidden Changes

- Do not export raw lead data.
- Do not trigger mass outreach.
- Do not weaken consent, confirmation, preference, or unsubscribe evidence.
- Do not alter Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.
- Do not print or persist secrets, real contact details, confirmation tokens, or raw production lead rows.
- Do not deploy without owner approval.

## Implementation Instructions

1. Run and record the pre-coding gate.
2. Stay inside the execution-plan scope.
3. Record compatibility risks for sgiprealestate, statex, and marketing-microservice.
4. Include migration notes for unsupported contact method types, max-30 bounds, and affirmative marketing-consent evidence.
5. Do not invent consumer-specific payloads beyond source-of-truth context.
6. Run focused DTO tests and build.
7. Update validation report, orchestrator status, and continuation state.

## Acceptance Criteria

- Consumer compatibility risk register is present.
- sgiprealestate, statex, and marketing-microservice each have a compatibility status and migration note.
- Consent targeting risk for marketing-microservice is explicit.
- Focused tests and build pass.

## Validation Commands

- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts`
- `npm run build`
