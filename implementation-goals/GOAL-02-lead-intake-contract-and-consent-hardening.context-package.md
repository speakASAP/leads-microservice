# Goal 2: Context Package

```yaml
id: LEADS-GOAL-02-CONTEXT-PACKAGE
status: active
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete-for-chunk-2.4
upstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.execution-plan.md
downstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.coding-prompt.md
```

## Task Summary

Record consumer compatibility risks for sgiprealestate, statex, and marketing-microservice after the Goal 2 public intake contract hardening.

## Source Documents

- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `TASKS.md`
- `STATE.json`
- `docs/IMPLEMENTATION_STATE.md`
- `docs/orchestrator/INTENT.md`
- `docs/orchestrator/PROJECT_INVARIANTS.md`
- `docs/orchestrator/GOALS.md`
- `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.md`
- DocsRAG HTTP 200 context from the Leads runtime pod.

## Relevant Files

- `src/leads/dto/create-lead.dto.ts`
- `src/leads/leads.controller.ts`
- `package.json`

## Current Contract

`POST /api/leads/submit` currently requires a non-empty `sourceService`, non-empty `message`, and 1 to 30 contact methods. Contact method types are bounded to `email`, `telegram`, and `whatsapp`. `marketingConsent: true` requires non-empty `consentSource` and valid ISO8601 `consentCapturedAt`; missing or `false` marketing consent remains no affirmative opt-in.

## Consumer Context

- `BUSINESS.md` lists approved consumers as sgiprealestate, statex, and marketing-microservice.
- DocsRAG returned marketing-microservice context stating that Leads contact data and consent live in leads-microservice, and marketing-microservice must only target leads with explicit marketing consent.
- `README.md` references `docs/EXTERNAL_INTEGRATION.md`, but the file is absent in the current repository.

## Required Behavior

Compatibility notes must be concrete enough for consumer migration planning while avoiding production payloads, real contact details, raw lead rows, confirmation tokens, private URLs, or secrets. No production mutation or runtime API smoke is needed for this documentation chunk.

## Constraints

- Use contract descriptions only.
- Do not print or persist secrets, real contact details, raw lead rows, confirmation tokens, private URLs, or production payloads.
- Do not run production mutation tests.
- Do not change runtime source, ownership boundaries, or deploy.

## Known Risks

- Consumer-specific payload shapes are not documented in this repo. Mitigation: record compatibility risks from the current Leads contract, source-of-truth consumer list, and DocsRAG marketing context; do not invent unstated request examples.

## Validation Commands

- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts`
- `npm run build`
- missing-marker scan over IPS docs
- secret/raw-data scan over changed docs/tests
