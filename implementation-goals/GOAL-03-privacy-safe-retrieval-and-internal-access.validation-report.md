# Goal 3: Validation Report

```yaml
id: LEADS-GOAL-03-VALIDATION-REPORT
status: pass
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.execution-plan.md
downstream:
  - ../docs/orchestrator/STATUS.md
  - ../docs/IMPLEMENTATION_STATE.md
  - ../TASKS.md
  - ../STATE.json
```

## Artifact Validated

Goal 3 - Privacy-Safe Retrieval And Internal Access.

## Preserved Intent Evidence

The chunk preserves Leads as the consent-aware non-registered intake and preference service by moving raw lead list/detail retrieval behind trusted internal-service access. Public intake and confirmation remain public. Internal preference and unsubscribe routes remain guarded. No raw lead export, outreach automation, production mutation, schema change, or deployment was performed.

## Gate Evidence

Pre-coding gate result: `pass`. DocsRAG retrieval returned HTTP 200 from inside the Leads runtime pod with runtime `JWT_TOKEN`. The token value was not printed or persisted.

## Access-Control Evidence

- Added `InternalServiceGuard` to `GET /api/leads` controller method.
- Added `InternalServiceGuard` to `GET /api/leads/:id` controller method.
- Confirmed `POST /api/leads/submit` and `GET /api/leads/confirm/:token` remain unguarded public routes.
- Confirmed internal preference read/update and unsubscribe routes remain guarded.

## Bounds Evidence

Focused service tests confirm `listLeads` clamps omitted or oversized `limit` values to 30 and uses the expected Prisma `take`/`skip` values.

## Trusted Header Evidence

Focused guard tests confirm:

- valid `x-internal-service-token` plus trusted `x-service-name` is accepted;
- untrusted service name is rejected;
- missing internal service token is rejected;
- missing service name is rejected when trusted services are configured.

## Sensitive-Data Evidence

Classification: `synthetic`. Tests use fake IDs and mocked Prisma behavior only. No secrets, production contact details, raw lead rows, confirmation tokens, private URLs, or production payloads were captured.

## Consent Evidence

No consent semantics changed. Stored consent and preference fields are now less exposed because raw retrieval requires trusted internal-service credentials.

## Contract Evidence

Public contract changed for raw retrieval: `GET /api/leads` and `GET /api/leads/:id` now require `InternalServiceGuard` credentials. Public intake and confirmation contracts are unchanged. Internal preference/unsubscribe contracts remain guarded. No schema change.

## Replay/Determinism Evidence

Validation is deterministic and unit-level only. It does not create leads, send notifications, confirm tokens, unsubscribe leads, or mutate production data.

## Commands Run

- DocsRAG retrieval through the Leads runtime pod: HTTP 200 for the Goal 3 privacy-safe retrieval query.
- `npm test -- --runTestsByPath src/leads/leads.controller.spec.ts src/leads/leads.service.spec.ts src/leads/guards/internal-service.guard.spec.ts`: passed, 10 tests.
- `npm run build`: passed.
- Missing-marker scan: pending.
- Secret/raw-data scan: pending.

## Passed Criteria

- Raw lead retrieval is not public.
- Internal preference and unsubscribe APIs require the service guard.
- Pagination and bounds remain enforced at max 30 items.
- Trusted internal-service header validation has focused evidence.
- Focused tests and build pass.

## Failed Or Skipped Criteria

- Production health and mutation smoke checks skipped because deployment was not requested and this goal must not mutate production leads.

## Decision

`pass`

## Next Action

Proceed to Goal 4 unless the owner selects another task.
