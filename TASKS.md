# Tasks: Leads Microservice

This file is the concise human-readable work queue. Detailed task contracts live under `docs/11_tasks/` and execution records remain linked there.

## Active
- None currently active per STATE.json (tasks_active: 0).

## Ready Next
- Resolve Goal 29 replay/backfill validation before broad live Orders event consumption (TASKS.md Backlog).

## Blocked
- Replay/backfill validation source for missed Orders order-created events is not yet defined; this blocks broad live Orders event consumption beyond new explicit lead-attribution events.

## completed

- 2026-07-01 goal-29d-orders-events-rabbitmq-vault-config-wired
- 2026-07-01 goal-29c-orders-created-live-broker-adapter-disabled-complete
- 2026-06-15 goal-24-25-26 integrated validation passed and deployed

## handoff

Current machine-readable state: [`STATE.json`](STATE.json). See `docs/orchestrator/STATUS.md` and `docs/orchestrator/GOALS.md` for the live goal cadence and the open Orders-events replay/backfill blocker.
