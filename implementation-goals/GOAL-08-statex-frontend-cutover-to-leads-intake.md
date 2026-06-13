# Goal 8 - StateX Frontend Cutover To Leads Intake

Status: done
Owner-selected: 2026-06-13

## Intent

Ensure StateX direct contact/prototype frontend submissions use `leads-microservice` as the consent-aware non-registered lead intake service.

## Scope

- StateX frontend source path: `/home/ssf/Documents/Github/statex/statex-website/frontend`.
- Cut over direct contact/prototype forms that still send platform notifications directly.
- Preserve existing dynamic `FormSection` Leads behavior.
- Do not deploy unless separately requested.

## Acceptance Criteria

- Direct contact/prototype forms submit to `POST /api/leads/submit` through `env.LEADS_SERVICE_URL`.
- Payload uses supported contact method types only: `email`, `telegram`, `whatsapp`.
- No raw contact values or raw messages are logged in frontend console output added by this goal.
- No production lead read/mutation validation is run.
