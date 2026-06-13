# Leads Goal Prompts

Use these prompts when the owner asks to implement or continue Leads work.

## Universal Session Prompt

Read `docs/orchestrator/MASTER_PROMPT.md`, `INTENT.md`, `GOALS.md`, `PLAN.md`, `PROJECT_INVARIANTS.md`, `PRE_CODING_GATE.md`, `READINESS_GATES.md`, and `STATUS.md`. Identify the active or earliest pending chunk. Restate the preserved Leads intent and ownership boundaries affected by the chunk. Complete only that chunk, verify it, append status evidence, and leave the next chunk clearly named.

## Goal 1 Prompt

Validate or maintain the Intent Preservation System for `leads-microservice`. Keep the workflow documentation-only unless the owner explicitly selects runtime work. Ensure future coding requires upstream traceability, invariant impact, sensitive-data classification, consent impact, contract impact, context package, execution plan, pre-coding gate, readiness checks, status evidence, and continuation state.

## Goal 2 Prompt

Implement the next unfinished chunk of "Goal 2 - Lead Intake Contract And Consent Hardening." Preserve public intake compatibility for approved consumers, keep validation bounded, and make consent evidence explicit. Do not export raw lead data or trigger outreach.

## Goal 3 Prompt

Implement the next unfinished chunk of "Goal 3 - Privacy-Safe Retrieval And Internal Access." Verify retrieval and preference APIs expose only necessary data through controlled paths. Preserve max list limits and internal-service trust boundaries.

## Goal 4 Prompt

Implement the next unfinished chunk of "Goal 4 - Notification And Confirmation Reliability." Keep notifications-microservice as the delivery owner, avoid token leakage, and verify failure behavior with synthetic or masked data only.

## Goal 5 Prompt

Implement the next unfinished chunk of "Goal 5 - AI And CRM Data-Sharing Boundary." Define or enforce data minimization, redaction, and explicit owner approval for raw lead export before any AI/CRM integration work.

## Goal 6 Prompt

Implement the next unfinished chunk of "Goal 6 - Operational Smoke And Documentation Ingestion." Record build, test, health, and DocsRAG evidence. If credentials are unavailable, record the blocker and do not fabricate retrieval evidence.

## Goal 11 Prompt

Implement the next unfinished chunk of "Goal 11 - Ecosystem Lead Lifecycle Contracts." Preserve Leads as the consent-aware non-registered warm-contact ledger. Define ecosystem contracts before runtime code. Do not move registered identity, campaign execution, notification delivery, payment ownership, logging storage, or AI model ownership into Leads. Use minimized events and guarded APIs by default; raw contact reveal, campaign launch, AI enrichment, or CRM export requires explicit owner approval and validation evidence.
