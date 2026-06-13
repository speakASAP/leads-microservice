# Goal 14 Execution Plan

## Pre-Coding Gate

- Upstream traceability: Goal 11 lifecycle contracts, Goal 12 builders, and Goal 13 controller adoption.
- Invariant review: Leads remains owner of non-registered confirmation, preferences, and unsubscribe; Marketing, CRM, Auth, Notifications, AI, and database ownership are unchanged.
- Sensitive-data review: lifecycle events remain minimized and tests assert omission of raw contact, confirmation token, private URL, and consent source values.
- Consent review: preference and unsubscribe events expose consent state summary only.
- Contract/schema review: no public route, DTO, database, or response contract changes.
- Replay/determinism review: idempotency keys are deterministic per lead and event timestamp for preference changes; confirmation key is deterministic per lead.
- Validation commands: focused Jest tests, `npm run build`, missing-marker scan, secret-pattern scan.

## Steps

1. Update controller imports and build `LeadConfirmed` after successful confirmation.
2. Build `LeadPreferenceUpdated` after preference update.
3. Build `LeadPreferenceUpdated` after unsubscribe.
4. Add focused controller tests for minimized lifecycle metadata.
5. Run validation and record evidence.
