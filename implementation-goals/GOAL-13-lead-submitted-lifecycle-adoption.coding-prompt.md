# Goal 13 Coding Prompt - LeadSubmitted Lifecycle Event Adoption

Adopt the existing minimized `LeadSubmitted` lifecycle event builder inside public intake only.

Allowed files:

- `src/leads/leads.controller.ts`
- `src/leads/leads.controller.spec.ts`

Do not change public response shape, routes, DTOs, Prisma schema, notification delivery, product-app integrations, campaign execution, AI/CRM export, or deployment.

Tests must prove the lifecycle logging metadata omits contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, and consent source values.
