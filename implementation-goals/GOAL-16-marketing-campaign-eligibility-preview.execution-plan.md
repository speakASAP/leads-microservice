# Goal 16 Execution Plan

## Gate Review

- Upstream traceability: Goal 11 marketing eligibility and lifecycle contracts.
- Invariant impact: Leads provides eligibility evidence only; Marketing owns campaigns and execution.
- Sensitive-data review: no contact values, raw messages, tokens, source URLs, metadata values, or campaign content in response/logging.
- Consent impact: marketing purpose requires affirmative consent evidence and no unsubscribe state.
- Contract/schema impact: guarded internal endpoint only; no Prisma schema change.
- Replay/determinism: eligibility reasons derive only from current lead state and request policy.
- Validation: focused tests, full tests, build, missing-marker scan, secret-pattern scan.

## Steps

1. Add request DTO.
2. Add service eligibility evaluation.
3. Add guarded controller endpoint and audit-safe summary log.
4. Add focused tests.
5. Update IPS state and validation evidence.
