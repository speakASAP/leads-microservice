# Goal 15 Execution Plan

## Gate Review

- Upstream traceability: Goals 11, 12, 13, and 14.
- Invariant impact: preserves Leads as non-registered lead lifecycle/consent owner; Auth remains identity owner.
- Sensitive-data classification: minimized lifecycle metadata only.
- Consent impact: no preference semantics change; conversion linkage does not prove campaign consent.
- Contract/schema impact: one guarded internal endpoint and local router service; no Prisma migration or public API change.
- Replay/determinism: conversion idempotency key is deterministic by lead, user, link method, and linked timestamp.
- Validation: focused Jest tests, build, missing-marker scan, secret-pattern scan.

## Steps

1. Add `LeadLifecycleEventRouterService`.
2. Refactor controller lifecycle event recording to use the router.
3. Add `LinkLeadToUserDto` and guarded conversion-link controller method.
4. Add a service lookup for conversion source metadata only.
5. Add focused tests for routing and conversion linkage minimization.
6. Update IPS state and validation evidence.
