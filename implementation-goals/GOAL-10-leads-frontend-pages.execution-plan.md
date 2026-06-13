# GOAL-10: Execution Plan - Leads Frontend Landing And Admin Pages

```yaml
id: LEADS-GOAL-10-EXECUTION-PLAN
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-10-leads-frontend-pages.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - GOAL-10-leads-frontend-pages.context-package.md
  - GOAL-10-leads-frontend-pages.coding-prompt.md
  - GOAL-10-leads-frontend-pages.validation-report.md
```

## Selected Goal

Goal 10 - Leads Frontend Landing And Admin Pages.

## Preserved Intent

Leads remains the consent-aware non-registered lead intake service. The landing page may create synthetic/public request-access leads through the existing validated intake endpoint. The admin dashboard is a review surface only and must not export raw lead data, trigger mass outreach, or take over Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.

## Invariant Impact

- Lead intake ownership: preserved; landing form uses `POST /api/leads/submit`.
- Consent evidence: preserved; affirmative contact consent sends `consentSource` and `consentCapturedAt`.
- Privacy-safe retrieval: preserved; admin loads data only through guarded `/api/leads` and masks contact values.
- Outreach boundary: preserved; no campaign execution or mass outreach added.

## Sensitive-Data Classification

`synthetic`: static UI copy and synthetic preview values only. No production rows or secrets used.

## Consent Impact

Landing request form supports explicit contact consent evidence. Admin dashboard displays consent source/timestamp, confirmation, preference, and unsubscribe state without changing semantics.

## Contract/Schema Impact

No database schema change. Existing API routes are reused. Static routes `/` and `/admin` are added before the `/api` global prefix; API contract remains unchanged.

## Replay/Determinism Impact

No retry, duplicate lead, unsubscribe, or confirmation behavior changed. Landing submissions are normal public lead submissions when a real user submits the form.

## Scope

Modify `src/main.ts`, `Dockerfile`, and `public/*` assets. Update Goal 10 documentation and orchestrator state.

## Non-Goals

No production deployment without owner approval. No raw lead export. No server-side registered-user Auth integration beyond the existing guarded API. No mass outreach.

## Validation Plan

- DocsRAG retrieval from Leads pod: HTTP 200.
- `npm run build`.
- `npm test`.
- Visual screenshot preview from `/private/tmp/leads-preview` for landing/admin desktop/mobile.
- Secret/missing-marker scans.
