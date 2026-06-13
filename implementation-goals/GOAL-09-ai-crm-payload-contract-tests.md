# Goal 9 - AI/CRM Payload Contract Tests

Status: done
Owner-selected: 2026-06-13

## Intent

Add contract tests proving any future AI/CRM lead-context payload builder omits contact values, raw messages, confirmation tokens, and private URLs.

## Scope

- Leads microservice only.
- Add a local pure payload builder only for minimized/sanitized analysis context if needed for tests.
- No AI client, CRM client, raw export, runtime outbound call, deployment, or production data access.

## Acceptance Criteria

- Tests use synthetic values only.
- Tests fail if sensitive fields appear in serialized AI/CRM context.
- `npm test -- --runTestsByPath ...` and `npm run build` pass.
