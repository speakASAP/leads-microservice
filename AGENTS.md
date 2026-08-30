# Agents: Leads Microservice

## required reading

Before implementation, read:

- `README.md`
- `BUSINESS.md`
- `SYSTEM.md`
- `AGENTS.md`
- `AGENT_OPERATIONS.md`
- `TASKS.md`
- `STATE.json`
- `docs/17_governance/PROJECT_INVARIANTS.md`
- `docs/01_vision/VISION.md`

## authority

Operators and agent workers may act only within the approved project intent, scope boundaries, and validation gates in this repository. Human approval is required for scope changes or production deployment decisions.

## intent preservation system

The project preserves the chain:

`Vision -> Goal Impact -> System -> Feature -> Task -> Execution Plan -> Coding Prompt -> Code -> Validation`

This is the binding requirement for planning, coding, and validation work.

## safety and operations

- Never commit secrets, credentials, or raw production data
- Keep the system grounded in proven repository facts
- Use `[MISSING: ...]` or `[UNKNOWN: ...]` instead of inventing facts
- Keep validation debt separate from current-task failures
- Prefer the narrowest valid validation command before broad test suites

## project-specific rules

- All implementation and orchestration work must happen on the remote alfares server in this repository; never copy staged source into production
- AI must never export raw lead data without explicit human approval
- No mass outreach without human review
- Max 30 items per request is a hard limit; do not increase request timeouts without first checking logs
- Use the Leads Intent Preservation System (docs/orchestrator/*) for all future work

## required final report

The final task report must include:

- files changed
- documents created or revised
- validation commands and results
- validation debt used or created
- active blockers as `[MISSING: ...]` or `[UNKNOWN: ...]`
- deviations from scope
- next concrete action
