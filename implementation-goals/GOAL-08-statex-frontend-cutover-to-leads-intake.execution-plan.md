# Goal 8 Execution Plan - StateX Frontend Cutover To Leads Intake

## Pre-Coding Gate

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 8 - StateX Frontend Cutover To Leads Intake
Repository roots: `/home/ssf/Documents/Github/leads-microservice`, `/home/ssf/Documents/Github/statex`
Git status: both clean before edits
DocsRAG query: HTTP 200 from Leads runtime pod; returned Leads minimization and notification context
Result: pass

## Invariants

- LEADS-INV-001 affected: frontend submissions must create Leads-owned lead records.
- LEADS-INV-003 preserved: no affirmative marketing consent is fabricated.
- LEADS-INV-004 affected: frontend code must avoid logging raw contact values or raw messages.
- LEADS-INV-005 preserved: no mass outreach.
- LEADS-INV-006 affected: public intake contract stays bounded.
- LEADS-INV-008 preserved: Leads may request confirmation through notifications; frontend does not own notification delivery.
- LEADS-INV-010 affected: status and validation evidence must be updated.

## Sensitive-Data Classification

Synthetic for tests/build only. No production lead rows, contact values, raw messages, confirmation tokens, private URLs, or secrets may be printed or persisted.

## Consent Impact

No marketing opt-in UI is added. The frontend omits marketing consent fields instead of fabricating consent evidence.

## Contract Impact

StateX direct forms change from platform-notification calls to Leads public intake. Leads API/schema does not change.

## Validation Plan

- Build StateX frontend or root image-level source with `npm run build` from `statex-website/frontend` when feasible.
- Run Leads focused AI/CRM contract tests after Goal 9.
- Run Leads `npm run build`.
- Run missing-marker and secret-pattern scans across Leads docs/artifacts.
