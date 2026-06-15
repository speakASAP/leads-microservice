# Leads Goal Prompts

Use these prompts when the owner asks to implement or continue Leads work.

## Universal Session Prompt

Read `docs/orchestrator/MASTER_PROMPT.md`, `INTENT.md`, `GOALS.md`, `PLAN.md`, `PROJECT_INVARIANTS.md`, `PRE_CODING_GATE.md`, `READINESS_GATES.md`, and `STATUS.md`. Refresh the parallel execution board, blockers, dependencies, file ownership, and active sessions. Select one owner-assigned or unblocked parallel-ready goal track for this session. Restate the preserved Leads intent and ownership boundaries affected by the track. Complete only that track or chunk, verify it, append status evidence, and leave the next parallel-ready and blocked tracks clearly named.

## Parallel Coordinator Prompt

Use this prompt when the owner asks to plan, refactor plans, or prepare work for multiple agents. Do not edit runtime source. Refresh `GOALS.md`, `PLAN.md`, `IMPLEMENTATION_STATE.md`, `TASKS.md`, `STATE.json`, and `STATUS.md` so work is split into independent goal tracks with blockers, dependencies, allowed file scope, validation ownership, and merge/deploy sequencing. Mark each track as `parallel-ready`, `blocked`, `serialized`, or `needs-owner-selection`. Run documentation-only readiness checks.

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

## Goal 21 Prompt

Goal 21 - Sanitized AI/CRM Context API is complete and deployed. Preserve minimized AI/CRM context only and do not add raw lead export, AI enrichment, CRM workflow ownership, or production mutation.

## Goal 22 Prompt

Implement "Goal 22 - Production Auth Workspace Token Matrix Validation." Validate deployed admin Auth behavior with masked/minimized output only. Positive non-global workspace scoped validation is blocked until owner-provided workspace admin tokens or approved synthetic staging tokens are available. Do not print tokens or production lead rows.

## Goal 23 Prompt

Implement "Goal 23 - Admin UI Scope Messaging And Empty-State Hardening." Improve scoped-empty, hidden-detail, unauthorized, and token-missing admin UI states without changing admin API contracts or exposing raw lead data.

## Goal 24 Prompt

Implement "Goal 24 - Internal Lifecycle Event Replay Consumer Contract." Start with docs, builders, and tests unless the owner selects a runtime route. Keep replay guarded, bounded, deterministic, and minimized.

## Goal 25 Prompt

Implement "Goal 25 - Marketing Approval Evidence Handoff Contract." Define approval evidence handoff for Marketing without storing campaign content, executing campaigns, initiating outreach, or exporting raw contacts.

## Goal 26 Prompt

Implement "Goal 26 - Product-App Intake Compatibility Matrix." Build Leads-side synthetic compatibility fixtures and tests. Do not edit product app repositories or submit production intake payloads unless the owner selects exact targets and payloads.

## Goal 27 Prompt

Implement "Goal 27 - Documentation Ingestion And Orchestrator Freshness." Keep this documentation-only unless separately approved. Refresh state, blockers, parallel execution board, DocsRAG evidence, and continuation instructions.
