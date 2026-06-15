# Goal 26 Coding Prompt - Product-App Intake Compatibility Matrix

Implement Goal 26 inside /home/ssf/Documents/Github/leads-microservice on alfares only.

Objective: build Leads-side synthetic fixtures and tests proving every approved product-app source service can produce a CreateLeadDto-compatible intake payload for each supported contact method type.

Scope:
- Add synthetic fixture/test files under src/leads/integrations.
- Use existing product-app taxonomy helpers and CreateLeadDto validation.
- Add Goal 26 execution, context, prompt, validation, and goal record artifacts.
- Append final evidence to docs/orchestrator/STATUS.md.

Non-goals:
- Do not edit product app repositories.
- Do not submit production lead payloads.
- Do not change DTO behavior, public API responses, Prisma schema, deployment, secrets, Notifications, Marketing, AI, or CRM behavior.

Validation:
- npm test -- --runTestsByPath src/leads/integrations/product-app-intake-matrix.spec.ts src/leads/integrations/product-app-intake.spec.ts
- npm run build
- missing-marker scan
- secret-pattern scan

Expected evidence: fixture count, source/contact-method coverage, DTO validation pass, synthetic-only handling, blockers for cross-repo and production mutation follow-ups.
