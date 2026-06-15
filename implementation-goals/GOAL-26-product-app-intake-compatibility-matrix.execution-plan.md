# Goal 26 - Product-App Intake Compatibility Matrix: Execution Plan

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 26 - Product-App Intake Compatibility Matrix
Chunk: 26.1 through 26.4, Leads-side synthetic matrix only
Repository root: /home/ssf/Documents/Github/leads-microservice
Git status: dirty before Goal 26 edits with prior shared-doc and runtime changes present; unrelated changes are preserved and not reverted.
DocsRAG query: attempted from the in-cluster Leads pod for Goal 26 product-app intake compatibility context; returned HTTP 500 with no retrieved text recorded. Repo-local source-of-truth docs and existing Goal 11/12 product-app contracts are used.
Execution plan: create synthetic product-app source/contact-method matrix fixtures, validate every fixture against CreateLeadDto locally, record compatibility risks and cross-repo follow-ups, and avoid product-app repositories and production submissions.
Context package: implementation-goals/GOAL-26-product-app-intake-compatibility-matrix.context-package.md
Coding prompt: implementation-goals/GOAL-26-product-app-intake-compatibility-matrix.coding-prompt.md
Invariants checked: LEADS-INV-001 preserved; LEADS-INV-002 preserved; LEADS-INV-003 strengthened by consent-evidence fixtures; LEADS-INV-004 preserved with synthetic values only; LEADS-INV-005 preserved; LEADS-INV-006 validated through DTO compatibility tests; LEADS-INV-007 unaffected; LEADS-INV-008 unaffected; LEADS-INV-009 preserved; LEADS-INV-010 satisfied by validation and status evidence.
Sensitive-data classification: synthetic.
Consent impact: no runtime consent behavior change; fixtures include affirmative marketing consent evidence and validate the existing CreateLeadDto requirements.
Contract/schema impact: validates POST /api/leads/submit DTO compatibility only. No public API response change, guarded API change, Prisma schema change, notification contract change, logging contract change, AI/CRM payload change, or product-app runtime change.
AI/CRM export impact: none; no AI/CRM client or export is added.
Outreach impact: none; no campaign execution, mass outreach, notification send, or contact resolution is added.
Replay/determinism impact: deterministic local DTO validation only; no lead creation, production mutation, confirmation, unsubscribe, notification, campaign, AI, or CRM side effect.
Allowed files to modify: src/leads/integrations/product-app-intake-matrix.fixtures.ts; src/leads/integrations/product-app-intake-matrix.spec.ts; implementation-goals/GOAL-26-*; docs/orchestrator/STATUS.md after validation.
Forbidden files/repos: StateX, Shop Assistant, Buzzos, FlipFlop, SpeakUp, Marathon, other product app repositories, Prisma schema, deployment scripts, secrets, and production data paths.
Validation commands: npm test -- --runTestsByPath src/leads/integrations/product-app-intake-matrix.spec.ts src/leads/integrations/product-app-intake.spec.ts; npm run build; missing-marker scan; secret-pattern scan over docs, implementation-goals, and Goal 26 source files.
Result: pass-with-documented-risk because DocsRAG returned HTTP 500, but local Goal 11/12 contracts and CreateLeadDto are sufficient for this narrow Leads-side synthetic matrix.
