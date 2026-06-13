# Goal 5 - AI And CRM Data-Sharing Boundary: Execution Plan

```yaml
id: LEADS-GOAL-05-EXECUTION-PLAN
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-05-ai-and-crm-data-sharing-boundary.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-05-ai-and-crm-data-sharing-boundary.context-package.md
  - GOAL-05-ai-and-crm-data-sharing-boundary.coding-prompt.md
  - GOAL-05-ai-and-crm-data-sharing-boundary.validation-report.md
```

## Selected Goal

Goal 5 - AI And CRM Data-Sharing Boundary. Complete chunks 5.1 through 5.4 as a documentation-only boundary definition because no current AI or CRM client exists in source.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake service. It may support human-reviewed CRM follow-up and AI-assisted analysis only through minimized, redacted, owner-approved context. It must not export raw lead data or trigger mass outreach.

## Goal Impact

This chunk records current and intended AI/CRM data-sharing paths, classifies sensitive lead fields, defines approval/redaction rules, adds a future validation checklist, and splits future runtime implementation into owner-approvable chunks.

## Invariant Impact

- `LEADS-INV-001`: preserved; Leads continues to own non-registered lead records and preference state.
- `LEADS-INV-002`: preserved; AI, CRM/Marketing, Notifications, Logging, Auth, and database ownership boundaries are not moved into Leads.
- `LEADS-INV-003`: strengthened; future AI/CRM work must preserve consent and unsubscribe evidence.
- `LEADS-INV-004`: strengthened; raw lead data and identifying fields are classified and restricted.
- `LEADS-INV-005`: strengthened; future CRM/Marketing handoff must not trigger mass outreach without human review.
- `LEADS-INV-006`: preserved; no public intake/list limit change.
- `LEADS-INV-007`: preserved; raw retrieval and preference reads remain behind `InternalServiceGuard`.
- `LEADS-INV-008`: preserved; notification delivery context is not reused as AI/CRM input.
- `LEADS-INV-009`: strengthened; raw AI/CRM export approval requirements are explicit.
- `LEADS-INV-010`: satisfied through status and continuation updates.

## Sensitive-Data Classification

`none`: documentation-only boundary work. No production rows, real contact details, raw messages, confirmation tokens, private URLs, CRM records, secrets, or raw integration payloads are printed or persisted.

## Consent Impact

No consent semantics change. The goal defines that AI/CRM consumers must preserve `marketingConsent`, `consentSource`, `consentCapturedAt`, preferences, and unsubscribe state, and must not infer targetability from contact presence alone.

## Contract/Schema Impact

No API, database schema, logging, notification, AI, or CRM runtime contract change. This goal documents future AI/CRM payload constraints and approval gates. Current raw list/detail and preference APIs remain guarded internal-service endpoints.

## Replay/Determinism Impact

No runtime calls, production mutation, lead creation, notification send, confirmation change, unsubscribe change, or CRM/AI retry behavior. Documentation validation is deterministic.

## Scope

- Identify current and intended AI/CRM call paths.
- Define data classes, minimization, redaction, and owner approval rules.
- Add validation checklist for prompts, logs, and integration payloads.
- Split future runtime work into owner-approvable chunks.
- Update orchestrator status and continuation state.

## Non-Goals

- Runtime AI client implementation.
- CRM client implementation.
- Raw production lead export.
- Production lead reads or mutations.
- Campaign execution or mass outreach.
- Deployment.

## Files To Inspect

- `BUSINESS.md`
- `SYSTEM.md`
- `README.md`
- `CLAUDE.md`
- `.env.example`
- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/guards/internal-service.guard.ts`
- `src/logging/logging.service.ts`
- `prisma/schema.prisma`
- `docs/orchestrator/*`
- Goal 2 through Goal 4 implementation artifacts

## Files To Modify

- `implementation-goals/GOAL-05-ai-and-crm-data-sharing-boundary.md`
- `implementation-goals/GOAL-05-ai-and-crm-data-sharing-boundary.execution-plan.md`
- `implementation-goals/GOAL-05-ai-and-crm-data-sharing-boundary.context-package.md`
- `implementation-goals/GOAL-05-ai-and-crm-data-sharing-boundary.coding-prompt.md`
- `implementation-goals/GOAL-05-ai-and-crm-data-sharing-boundary.validation-report.md`
- `implementation-goals/README.md`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`

## Validation Plan

- `find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print`
- `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`
- Secret-pattern scan across `docs`, `AGENTS.md`, `TASKS.md`, and `implementation-goals`.
- `npm run build`

## Pre-Coding Gate

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 5 - AI And CRM Data-Sharing Boundary
Chunk: 5.1, 5.2, 5.3, 5.4
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: dirty from prior Goal 4 changes; Goal 5 will not revert unrelated changes.
DocsRAG query: passed from inside the Leads runtime pod using runtime `JWT_TOKEN`; HTTP 200 for query "Leads microservice AI CRM data sharing boundary raw lead export redaction minimization approval rules".
Execution plan: this file.
Context package: `GOAL-05-ai-and-crm-data-sharing-boundary.context-package.md`.
Coding prompt: `GOAL-05-ai-and-crm-data-sharing-boundary.coding-prompt.md`.
Invariants checked: `LEADS-INV-001` through `LEADS-INV-010`.
Sensitive-data classification: `none`.
Consent impact: no semantics change; future AI/CRM work must preserve consent and unsubscribe evidence.
Contract/schema impact: no runtime contract or schema change.
AI/CRM export impact: no AI/CRM export; approval gate documented for future work.
Outreach impact: no outreach automation.
Validation commands: documentation scans and `npm run build`.
Result: pass.

## Rollback Plan

Revert the Goal 5 documentation/state updates with a targeted patch while preserving prior Goal 4 changes and status history. If a correction is needed, append a new status entry rather than deleting recorded evidence.
