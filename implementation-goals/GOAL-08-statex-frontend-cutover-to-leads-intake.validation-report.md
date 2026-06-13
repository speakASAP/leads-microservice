# Goal 8 Validation Report - StateX Frontend Cutover To Leads Intake

Status: accepted
Date: 2026-06-13

## Scope

Cut over StateX direct contact/prototype pages from direct platform notification calls to Leads public intake.

## Implementation Evidence

- Added `statex-website/frontend/src/services/leadsService.ts` in `/home/ssf/Documents/Github/statex`.
- Updated `statex-website/frontend/src/components/forms/DirectForm.tsx` to call `submitDirectLead`.
- Removed direct platform notification payload construction from `DirectForm`.
- Preserved existing dynamic `FormSection` Leads behavior.
- Used existing `NEXT_PUBLIC_LEADS_SERVICE_URL=https://leads.alfares.cz` runtime contract.

## Data Safety

No production lead data was read or created during validation. The new direct-form helper does not add console logging of raw contact values or raw messages.

## Consent Impact

No marketing opt-in UI was added. The direct form omits marketing consent fields rather than fabricating consent evidence.

## Contract Impact

StateX direct forms now submit to `POST /api/leads/submit`. Leads API/schema did not change.

## Validation Evidence

- `npm run build` from `/home/ssf/Documents/Github/statex/statex-website/frontend`: passed. Next emitted pre-existing config/browserslist warnings and generated build metadata, which was removed from the working tree after validation.

## Decision

Integration readiness accepted. Deployment readiness was not evaluated because deployment was not requested.
