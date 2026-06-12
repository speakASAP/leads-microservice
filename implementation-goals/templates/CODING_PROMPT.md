# GOAL-XX: Coding Prompt Template

```yaml
id: LEADS-GOAL-XX-CODING-PROMPT
status: draft
owner: leads-owner
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
completeness_level: template
upstream:
  - GOAL-XX-name.context-package.md
  - GOAL-XX-name.execution-plan.md
downstream:
  - GOAL-XX-name.validation-report.md
```

## Task Summary

Implement the selected Leads goal chunk.

## Required Context

Read the selected goal, execution plan, context package, and pre-coding gate before edits.

## Allowed Changes

List exact files and behavior.

## Forbidden Changes

- Do not export raw lead data.
- Do not trigger mass outreach.
- Do not weaken consent, confirmation, preference, or unsubscribe evidence.
- Do not alter Auth, Notifications, Marketing, Logging, database infrastructure, or AI ownership.
- Do not print or persist secrets, real contact details, confirmation tokens, or raw production lead rows.
- Do not deploy without owner approval.

## Implementation Instructions

1. Run and record the pre-coding gate.
2. Stay inside the execution-plan scope.
3. Preserve Leads intent and invariants.
4. Run validation commands.
5. Update validation report, status, and continuation state.

## Acceptance Criteria

List task-specific criteria.

## Validation Commands

List exact commands.
