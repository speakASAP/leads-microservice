# Repository Agent Instructions

Shared rules live here:

- Codex profile: `/home/ssf/.codex/AGENTS.md`
- Cross-agent standard: `/home/ssf/.ai-agent-standards/CROSS_AGENT_AUTOMATION_STANDARD.md`
- Repository operations: `AGENT_OPERATIONS.md`

Read those first, then follow the repository-specific notes below and the current planning/status files.


## Repository-Specific Notes

# Agents: leads-microservice

## Remote-First Working Rule

All implementation and orchestration work for this project must happen on the remote `alfares` server in:

```bash
/home/ssf/Documents/Github/leads-microservice
```

Use local files only as a temporary staging mirror when needed, then copy changes to the remote repo and validate on `alfares`.

## Knowledge Retrieval (query before reading files)

Query the RAG service first to reuse indexed ecosystem context before broad architecture or cross-service file review:

```bash
curl -s -X POST http://docs-rag-microservice.statex-apps.svc.cluster.local:3397/retrieval/agent-context \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR QUESTION HERE", "maxTokens": 3000}'
```

- Internal URL: `http://docs-rag-microservice.statex-apps.svc.cluster.local:3397`
- Public URL: `https://docs-rag.alfares.cz`
- Full guide: `docs-rag-microservice/docs/RAG_USAGE.md`
- If a token is unavailable, record that limitation in `docs/orchestrator/STATUS.md` and use repo-local source-of-truth docs only.

No autonomous AI agents. Business logic is rule-based.

## Intent Preservation

Use the Leads Intent Preservation System for all future work:

- Start from `docs/IMPLEMENTATION_STATE.md`.
- Read `docs/IMPLEMENTATION_ORCHESTRATOR.md`.
- Read `docs/orchestrator/MASTER_PROMPT.md`, `INTENT.md`, `GOALS.md`, `PLAN.md`, `PROJECT_INVARIANTS.md`, `PRE_CODING_GATE.md`, `CONTEXT_PACKAGE.md`, `EXECUTION_PLAN.md`, `READINESS_GATES.md`, `PROMPTS.md`, and `STATUS.md`.
- Prefer parallel planning before selecting work: identify independent pending goals, blockers, dependencies, file ownership, and validation ownership so multiple Codex sessions can execute safely in parallel.
- Select one unblocked goal track for the current session. Do not start two implementation tracks in one worker session unless the owner explicitly asks for a coordinator-only planning update.
- Before source edits, create or update the goal-specific execution plan, context package, coding prompt, and validation report under `implementation-goals/`.
- Run the pre-coding gate and block on unresolved execution-critical gaps.
- After work, record validation evidence in `docs/orchestrator/STATUS.md` and update continuation state.

## Parallel Planning Standard

Planning should maximize safe use of parallel Codex agents:

- Break roadmaps into goal-level tracks that can be owned by different sessions.
- For each goal, record status, dependencies, blockers, allowed file scope, non-goals, validation commands, and merge/deploy sequencing.
- Mark a goal as parallel-ready only when it does not require the same source files, migrations, runtime config, deployment slot, or production validation data as another active goal.
- If two goals touch shared contracts, schemas, Prisma migrations, guarded routes, or deployment configuration, pick one owner and mark the other blocked until the shared surface is merged.
- Keep safety gates mandatory for every worker: upstream traceability, invariant impact, sensitive-data classification, consent impact, contract/schema impact, replay/determinism review, explicit validation commands, and readiness evidence.
- Coordinator sessions may update the parallel task board without coding. Worker sessions implement exactly one assigned goal track and append evidence.

Preserved intent: Leads is the consent-aware non-registered lead intake service. It owns lead records, contact methods, submissions, confirmation, preferences, and unsubscribe state. It must not export raw lead data, trigger mass outreach without human review, or take over Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.

## Required Gates

Future coding requires:

- upstream traceability;
- invariant impact review;
- sensitive-data classification;
- consent impact review;
- contract/schema impact review;
- replay/determinism review;
- explicit validation commands;
- readiness evidence.

Do not code when raw lead data export, mass outreach, consent semantics, trusted internal-service access, or production mutation validation is unclear.

## Active Agents
<!-- Coordinator-maintained -->
- Goal 22 token validation: Codex thread 019ec9bb-426c-7f10-aaa3-63922c110bc6 active from 2026-06-15; docs/status and masked smoke validation only.
- Goal 24 FlipFlop replay consumer: Codex thread 019ec9bb-44d9-7523-81b8-2627d271dc9f active from 2026-06-15; Leads replay route/contract plus FlipFlop consumer scope.
- Goal 25 Leads-owned approval evidence storage: Codex thread 019ec9bb-4908-7f10-b35b-5cdb3132bc87 active from 2026-06-15; migration-owner lane, no campaign execution.
- Goal 26 FlipFlop product-app intake adoption: Codex thread 019ec9bb-8b2a-7571-89bd-bbefb7cf78fb active from 2026-06-15; FlipFlop integration lane, no production lead mutation.
- Agent A: Goal 22 - Production Auth Workspace Token Matrix Validation; blocked pending valid approved global/non-global admin tokens; thread 019ec2b5-7c3a-7c41-aee7-b58fccea1367.
- Agent B: Goal 23 - Admin UI Scope Messaging And Empty-State Hardening; complete; thread 019ec2b5-8ea3-7912-97e3-bbb4eed5a898.
- Agent C: Goal 24 - Internal Lifecycle Event Replay Consumer Contract; complete for docs/builders/tests; thread 019ec2b8-3bd4-75c2-863a-ef788fe41833.
- Agent D: Goal 25 - Marketing Approval Evidence Handoff Contract; complete for contract/builders/tests; thread 019ec2b5-9b05-74e3-96a8-38954e713eb6.
- Agent E: Goal 26 - Product-App Intake Compatibility Matrix; complete for Leads-side matrix; thread 019ec2b5-a1d1-73f2-820a-8a9aaf55cff7.
- Agent F: Goal 27 - Documentation Ingestion And Orchestrator Freshness; complete documentation-only; thread 019ec2b5-a8ac-7b40-aae4-b0319d7bcad0.

## Recently Completed Agent Lanes
<!-- Coordinator-maintained -->
- Agent E: Goal 26 - Product-App Intake Compatibility Matrix; Codex thread `019ec2b5-a1d1-73f2-820a-8a9aaf55cff7` (`Leads Goal 26 - Product Intake Matrix`); completed Leads-side synthetic matrix on 2026-06-13, with cross-repo adoption still blocked pending owner target selection.
- Agent F: Goal 27 - Documentation Ingestion And Orchestrator Freshness; Codex thread `019ec2b5-a8ac-7b40-aae4-b0319d7bcad0` (`Leads Goal 27 - Orchestrator Freshness`); completed documentation-only refresh on 2026-06-13.
