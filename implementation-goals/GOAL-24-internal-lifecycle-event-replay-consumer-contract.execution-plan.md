# Goal 24 Execution Plan

## Selected Goal

Goal 24 - Internal Lifecycle Event Replay Consumer Contract.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake, confirmation, preference, unsubscribe, and minimized lifecycle evidence owner. Replay must not make Leads the centralized logging owner, registered identity owner, campaign execution owner, notification delivery owner, CRM workflow owner, database infrastructure owner, or AI owner.

## Goal Impact

This goal defines a future-safe internal replay contract over minimized lifecycle events already owned by Leads. Runtime route shape remains serialized until the owner selects the first consumer.

## Pre-Coding Gate

- Gate: pass with documented DocsRAG limitation.
- Date: 2026-06-13.
- DocsRAG: attempted from plain SSH shell; no usable response was returned. Repo-local source-of-truth docs were used for this narrow contract/test track.
- Invariants checked: LEADS-INV-001 through LEADS-INV-010.
- Sensitive-data classification: minimized/synthetic only.
- Consent impact: replay may expose consent state/evidence presence, never raw consent source values.
- Contract impact: pure TypeScript replay contract/builder and tests only; no runtime API change.
- Replay/determinism impact: deterministic ordering and bounded result size required.

## Invariant Impact

- LEADS-INV-001: strengthened by clarifying Leads-owned minimized lifecycle replay.
- LEADS-INV-002: preserved; external ownership boundaries unchanged.
- LEADS-INV-003: preserved; no consent semantics changed.
- LEADS-INV-004: high impact; tests prove sensitive values are omitted from replay output.
- LEADS-INV-005: preserved; no outreach automation.
- LEADS-INV-006: preserved; public intake unchanged.
- LEADS-INV-007: preserved for future runtime use by requiring trusted internal access and one-lead scope.
- LEADS-INV-008: preserved; no notification delivery change.
- LEADS-INV-009: preserved; no AI/CRM raw export.
- LEADS-INV-010: satisfied through goal artifacts and validation evidence.

## Sensitive-Data Classification

Replay data class is `minimized`. Tests use synthetic identifiers and red-team strings only. Replay payloads must omit contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, and campaign content.

## Consent Impact

No consent, confirmation, preference, or unsubscribe semantics change. Replay may include `marketingConsent`, `consentEvidencePresent`, confirmation booleans/timestamps, unsubscribe timestamps, and preference counts already present in minimized lifecycle payloads.

## Contract Impact

Adds an internal builder contract with request purpose, consumer, lead ID, optional bounds, max limit, explicit evidence owner, centralized log owner, and minimized event list. No Prisma schema, migration, controller, deployment, public API, or production data change is included.

## Replay And Determinism Impact

Replay responses sort deterministically, enforce a maximum event bound of 30, filter events to the requesting consumer's route membership, and rebuild payloads from event-type allowlists.

## Scope

Goal 24 artifacts, replay contract builder/types, focused replay tests, and status evidence.

## Non-Goals

No runtime route change, durable storage, Prisma migration, raw lead export, production lead read/mutation, campaign execution, notification dispatch, AI/CRM export, deployment, or logging ownership change.

## Validation Plan

- `npm test -- --runTestsByPath src/leads/integrations/lifecycle-replay-contract.spec.ts`
- `npm run build`
- missing-marker scan
- sensitive-pattern scan over Goal 24 artifacts and replay source/tests
