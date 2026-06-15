# Goal 26 Context Package - Product-App Intake Compatibility Matrix

## Upstream Traceability

- Vision: Leads remains the consent-aware intake service for non-registered contacts.
- Goal Impact: prove approved product-app payload shapes remain compatible with Leads public validation and source taxonomy before any cross-repo app edits.
- System: NestJS Leads public intake DTO validation in src/leads/dto/create-lead.dto.ts.
- Feature: product-app intake taxonomy and local builder from Goal 11 and Goal 12.
- Task: Goal 26 chunks 26.1 through 26.4.
- Execution Plan: implementation-goals/GOAL-26-product-app-intake-compatibility-matrix.execution-plan.md.
- Coding Prompt: implementation-goals/GOAL-26-product-app-intake-compatibility-matrix.coding-prompt.md.
- Validation: implementation-goals/GOAL-26-product-app-intake-compatibility-matrix.validation-report.md and docs/orchestrator/STATUS.md.

## Source Context Reviewed

- BUSINESS.md and SYSTEM.md.
- AGENTS.md and Leads orchestrator docs.
- docs/orchestrator/GOALS.md Goal 26.
- implementation-goals/GOAL-11-ecosystem-lead-lifecycle-contracts.product-apps.md.
- implementation-goals/GOAL-12-lifecycle-product-app-contract-builders.execution-plan.md.
- src/leads/integrations/product-app-intake.ts and existing focused tests.
- src/leads/dto/create-lead.dto.ts.

## Approved Taxonomy Under Test

Approved source services: shop-assistant, buzzos, flipflop, speakup, marathon, statex, sgiprealestate, leads-landing, shared-landing.

Supported contact method types: email, telegram, whatsapp.

The synthetic matrix must cover every approved source service paired with every supported contact method type.

## Data Rules

- Use only synthetic reserved-domain or synthetic handle values in fixtures.
- Do not submit any fixture to production.
- Do not print tokens, secrets, production lead rows, raw production contact values, raw production messages, confirmation tokens, private URLs, metadata values, raw consent source values, JWTs, or session tokens.
- Keep validation failures focused on DTO property names where practical.

## Blockers And Follow-Ups

- Cross-repo app edits remain blocked until the owner selects target apps and repositories.
- Production intake mutation validation remains blocked without exact owner-approved synthetic payloads.
- New sourceService values require taxonomy documentation before production use.
