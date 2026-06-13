# Goal 10 - Leads Frontend Landing And Admin Pages

Status: done
Owner request: create a customer landing page and an admin section for registered/authorized users with comprehensive lead operational visibility.

## Scope

- Add a public landing page for potential customers buying the Leads service.
- Add an admin dashboard shell for authorized operators.
- Preserve Leads as a consent-aware intake and preference service.
- Keep admin data access behind the existing guarded Leads API.

## Implementation Summary

- Landing page served at `/` with product positioning, workflow, governance, and request-access form.
- Admin page served at `/admin` with secure access panel, metrics, source mix, consent health, confirmation queue, filters, recent leads table, and selected lead detail panel.
- Admin browser UI does not load lead data until an internal service token is supplied, and contact values are masked in rendered tables/details.
- Docker runtime now copies `public/` so the pages ship with the Nest service image.

## Sensitive-Data Handling

No raw production lead rows, real contact details, confirmation tokens, private URLs, or secrets were read or persisted during implementation. Screenshots use static shell content only. Admin UI fetches guarded API data only when an operator supplies credentials.

## Validation

See `GOAL-10-leads-frontend-pages.validation-report.md`.
