# Goal 12 Coding Prompt - Lifecycle And Product-App Contract Builders

Implement Goal 12 only within the named source scope:

- `src/leads/integrations/lifecycle-events.ts`
- `src/leads/integrations/lifecycle-events.spec.ts`
- `src/leads/integrations/product-app-intake.ts`
- `src/leads/integrations/product-app-intake.spec.ts`

Add local builders and tests only. Do not add runtime event emission, message bus clients, controller endpoints, Prisma migrations, product-app edits, campaign execution, notification sends, AI exports, CRM exports, production reads, production mutations, or deployment.

Use synthetic test data. Tests must prove minimized lifecycle payloads and safe product-app log summaries do not contain contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, or consent source values.
