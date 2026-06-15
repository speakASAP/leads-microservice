# Goal 21 - Sanitized AI/CRM Context API

Status: complete and deployed.

Intent: Leads should provide future AI/CRM consumers a guarded, minimized one-lead context contract so they do not need raw lead list/detail reads by default.

Selected slice: add a guarded internal endpoint that returns the existing sanitized AI/CRM context for one lead.

Non-goals:

- No AI client, CRM client, outbound export, batch export, or raw lead export.
- No contact reveal, campaign execution, notification dispatch, or production lead mutation.
- No public API change, Auth runtime change, or Prisma schema migration.
- Deployment completed only after explicit owner approval on 2026-06-13.

Acceptance criteria:

- `GET /api/leads/internal/:id/sanitized-context` is guarded by `InternalServiceGuard`.
- The response uses the existing sanitized AI/CRM context builder and omits contact values, raw message text, confirmation tokens, private source URL path/query values, metadata values, and raw consent source values.
- Missing leads return existing not-found behavior.
- Logs contain aggregate/minimized context metadata only.
- Focused controller and service tests prove guard coverage and sensitive-field omission.
