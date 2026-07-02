# BPCP Holiday Discount Adoption

Status: service-local adoption contract
Date: 2026-07-02
Service: `leads-microservice`
Central contract pack: `statex-ecosystem/docs/business-process-control-plane/`

## Role

Optional attribution and lead capture consumer for campaign-driven customer interest.

## Responsibilities

- Capture campaign attribution for leads only if the Holiday Discount journey includes lead forms.
- Do not evaluate discount eligibility.

## Required interfaces

- Campaign attribution fields: processId, processVersion, campaignRef.
- Consent-safe lead intake.

## Boundaries

- This service must not become the global owner of BPCP process definitions.
- This service must fail closed on invalid or unknown BPCP process versions.
- This service must keep existing domain ownership and invariants.
- This service must expose or document dry-run behavior before live execution.
- This service must not overwrite existing service contracts without an
  explicit integration owner and validation owner.

## Holiday Discount pilot expectations

- Recognize `holiday-discount-2026` only through versioned BPCP contracts.
- Preserve `processId`, `processVersion`, and `policyId` in every relevant
  decision, event, snapshot, log, or rendered experience.
- Support rollback by respecting BPCP pause and retired states.
- Keep process display and process execution separate where applicable.

## Blockers and unknowns

- [MISSING: whether Holiday Discount pilot includes lead capture]

## Validation evidence required before implementation is accepted

- Lead fixture preserves attribution without monetary decision.
- Consent checks pass.

## Parallel handoff

This adoption doc is safe for a focused service owner to implement in parallel
after the central BPCP schemas are accepted. The service owner must not edit
shared BPCP schemas directly; schema changes go through the BPCP integration
owner.
