# Goal 2: Validation Report

```yaml
id: LEADS-GOAL-02-VALIDATION-REPORT
status: pass
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete-for-chunk-2.4
upstream:
  - GOAL-02-lead-intake-contract-and-consent-hardening.execution-plan.md
downstream:
  - ../docs/orchestrator/STATUS.md
  - ../docs/IMPLEMENTATION_STATE.md
  - ../TASKS.md
  - ../STATE.json
```

## Artifact Validated

Goal 2 - Lead Intake Contract And Consent Hardening, chunk 2.4: consumer compatibility risks for sgiprealestate, statex, and marketing-microservice.

## Preserved Intent Evidence

The chunk preserves Leads as the consent-aware non-registered intake service by documenting consumer compatibility risks for the hardened public intake contract. No runtime source edits, raw lead export, outreach automation, production mutation, schema change, or deployment was performed.

## Gate Evidence

Pre-coding gate result: `pass`. DocsRAG retrieval returned HTTP 200 from inside the Leads runtime pod with runtime `JWT_TOKEN`. The token value was not printed or persisted.

## Compatibility Evidence

Consumer compatibility risks were recorded in `implementation-goals/GOAL-02-lead-intake-contract-and-consent-hardening.md`:

- `sgiprealestate`: compatible with migration note for supported contact method types and affirmative marketing-consent evidence.
- `statex`: compatible with migration note for max-30 contact method bound, no custom contact method types, and consent evidence.
- `marketing-microservice`: compatible with migration note requiring explicit `marketingConsent: true`, `consentSource`, and `consentCapturedAt` before targeting non-registered leads.
- Repository documentation gap recorded: `README.md` references `docs/EXTERNAL_INTEGRATION.md`, but the file is absent.

## Sensitive-Data Evidence

Classification: `none`. This chunk records contract descriptions only. No secrets, production contact details, raw lead rows, confirmation tokens, private URLs, or production payloads were captured.

## Consent Evidence

Compatibility notes preserve the existing consent rule: missing or `false` marketing consent is no affirmative opt-in; `marketingConsent: true` requires `consentSource` and `consentCapturedAt`. No consent semantics changed in this chunk.

## Contract Evidence

No new contract or schema change. This chunk documents migration notes for the existing public intake DTO validation contract for `POST /api/leads/submit`.

## Replay/Determinism Evidence

Validation is deterministic and documentation/test/build only. It does not create leads, send notifications, confirm tokens, unsubscribe leads, or mutate production data.

## Commands Run

- DocsRAG retrieval through the Leads runtime pod: HTTP 200 for the chunk 2.4 consumer-compatibility query.
- `npm test -- --runTestsByPath src/leads/dto/create-lead.dto.spec.ts`: passed, 12 tests.
- `npm run build`: passed.
- `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`: no matches, exit status 1.
- `rg -n 'Authorization: Bearer [A-Za-z0-9_./+=:-]{12,}|(access[_-]?token|client[_-]?secret|password|private[_-]?key|confirmation[_-]?token)\s*[:=]\s*[A-Za-z0-9_./+=:-]{12,}' docs AGENTS.md TASKS.md implementation-goals src/leads/dto/create-lead.dto.spec.ts`: no matches, exit status 1.

## Passed Criteria

- Consumer compatibility risk register is present.
- sgiprealestate has a compatibility status and migration note.
- statex has a compatibility status and migration note.
- marketing-microservice has a compatibility status and migration note.
- Focused DTO tests and build pass.

## Failed Or Skipped Criteria

- Runtime source edits skipped because chunk 2.4 is documentation-only.
- Production health and mutation smoke checks skipped because chunk 2.4 does not deploy and must not mutate production leads.

## Decision

`pass`

## Next Action

Proceed to Goal 3 unless the owner selects another task.
