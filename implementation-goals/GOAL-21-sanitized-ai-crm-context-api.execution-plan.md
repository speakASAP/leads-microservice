# Goal 21 - Sanitized AI/CRM Context API: Execution Plan

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 21 - Sanitized AI/CRM Context API
Chunk: 21.1 guarded one-lead sanitized context retrieval
Repository root: /home/ssf/Documents/Github/leads-microservice
Git status: clean before Goal 21 edits
DocsRAG query: attempted from in-cluster Leads pod for sanitized AI/CRM context API; returned HTTP 500, so repo-local source-of-truth docs and existing Goal 5/9 contracts are used.
Execution plan: add a guarded internal controller method, add service retrieval that feeds the existing sanitized builder, add focused tests, update status and continuation state.
Context package: implementation-goals/GOAL-21-sanitized-ai-crm-context-api.context-package.md
Coding prompt: implementation-goals/GOAL-21-sanitized-ai-crm-context-api.coding-prompt.md
Invariants checked: LEADS-INV-001 preserved; LEADS-INV-002 preserved; LEADS-INV-003 preserved; LEADS-INV-004 strengthened; LEADS-INV-005 preserved; LEADS-INV-006 unaffected; LEADS-INV-007 preserved; LEADS-INV-008 unaffected; LEADS-INV-009 strengthened; LEADS-INV-010 will be satisfied by status evidence.
Sensitive-data classification: synthetic for tests; sensitive production rows are not printed or persisted.
Consent impact: no consent semantics change; response reports consent evidence presence only and does not expose consentSource value.
Contract/schema impact: new guarded internal API only; no public API or schema change.
AI/CRM export impact: minimized internal context only; no outbound AI/CRM export and no raw data export.
Outreach impact: no outreach automation or campaign execution.
Validation commands: npm test -- --runTestsByPath src/leads/leads.service.spec.ts src/leads/leads.controller.spec.ts; npm run build; npm run lint; npm test; missing-marker scan; secret-pattern scan.
Result: pass.
