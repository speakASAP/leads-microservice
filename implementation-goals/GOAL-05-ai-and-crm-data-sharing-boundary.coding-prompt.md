# Goal 5 - AI And CRM Data-Sharing Boundary: Coding Prompt

```yaml
id: LEADS-GOAL-05-CODING-PROMPT
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-05-ai-and-crm-data-sharing-boundary.context-package.md
  - GOAL-05-ai-and-crm-data-sharing-boundary.execution-plan.md
downstream:
  - GOAL-05-ai-and-crm-data-sharing-boundary.validation-report.md
```

## Task Summary

Complete Goal 5 as a documentation-only boundary task: identify AI/CRM paths, define redaction/minimization and approval rules, add a validation checklist, and split future implementation into owner-approvable chunks.

## Required Context

Read the selected goal, execution plan, context package, pre-coding gate, and source files named in the execution plan before edits.

## Allowed Changes

- Add the Goal 5 goal record and execution artifacts under `implementation-goals/`.
- Update `docs/orchestrator/GOALS.md`, `docs/orchestrator/STATUS.md`, `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, `STATE.json`, and `implementation-goals/README.md` for continuation state.
- Documentation-only edits that clarify AI/CRM data-sharing boundaries.

## Forbidden Changes

- Do not implement AI calls.
- Do not implement CRM exports.
- Do not export raw lead data.
- Do not trigger mass outreach.
- Do not weaken consent, confirmation, preference, or unsubscribe evidence.
- Do not alter Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.
- Do not print or persist secrets, real contact details, confirmation tokens, raw production lead rows, raw messages, private URLs, CRM records, or production payloads.
- Do not deploy without owner approval.

## Implementation Instructions

1. Record the pre-coding gate with DocsRAG evidence and dirty-tree note.
2. Document current AI/CRM call paths from source inspection.
3. Define data classes, redaction/minimization rules, raw-export approval requirements, and future validation checklist.
4. Split future runtime work into owner-approvable chunks.
5. Run documentation scans and `npm run build`.
6. Update validation report, status, and continuation state.

## Acceptance Criteria

- AI/CRM integration data classes are documented.
- Current and intended AI/CRM paths are identified.
- Raw lead export requires explicit owner approval in the active task.
- Validation checklist covers prompts, logs, screenshots, validation reports, and integration payloads.
- Future runtime work is split into owner-approvable chunks.
- No raw lead data, secrets, confirmation tokens, private URLs, CRM records, or production payloads are captured.

## Validation Commands

- `find docs/orchestrator implementation-goals -maxdepth 2 -type f -name '*.md' -print`
- `rg "\[(MISSING|UNKNOWN):" docs/orchestrator docs/IMPLEMENTATION_ORCHESTRATOR.md docs/IMPLEMENTATION_STATE.md implementation-goals AGENTS.md`
- Secret-pattern scan across `docs`, `AGENTS.md`, `TASKS.md`, and `implementation-goals`.
- `npm run build`
