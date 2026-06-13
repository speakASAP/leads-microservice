# Goal 8 Context Package

## Source Context

- `statex-website/frontend/src/config/env.ts` already exposes `LEADS_SERVICE_URL`.
- `statex-website/frontend/src/components/sections/FormSection.tsx` already submits dynamic forms to Leads.
- `statex-website/frontend/src/components/forms/DirectForm.tsx` still submits direct pages through platform notification endpoints.
- Leads `CreateLeadDto` requires sourceService, message, and 1-30 contact methods with types `email`, `telegram`, or `whatsapp`.

## Non-Goals

- No frontend deployment.
- No production lead creation as validation.
- No CRM/raw export design.
- No mass outreach behavior.
