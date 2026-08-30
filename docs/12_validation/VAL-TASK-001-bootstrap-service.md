# Validation: Leads Microservice IPS adoption bootstrap

```yaml
id: VAL-TASK-001-bootstrap-service
status: validated
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - ../11_tasks/TASK-001-bootstrap-service.md
  - ../22_goal_impact/GOAL-IMPACT-TASK-001.md
downstream:
[]
```

## summary

The leads-microservice repository now includes the complete required IPS adoption document set, reformatted from real pre-existing BUSINESS.md/SYSTEM.md/AGENTS.md/README.md/TASKS.md/STATE.json content plus observed .env.example and src/ facts, with no fabricated business claims.

## upstream goal

This validation closes `TASK-001-bootstrap-service`, which advances `../22_goal_impact/GOAL-IMPACT-TASK-001.md`.

## acceptance criteria evidence

- Required root and docs/ artifacts are present and populated with project-specific content
- Integration review covers all 16 capabilities with concrete required/not-applicable decisions and evidence-grounded reasons
- STATE.json and TASKS.md reflect the real current state, including the open Orders replay/backfill blocker

## gate evidence

- `validate_adoption_profile.py --root leads-microservice --phase planning` exits 0 (see command output recorded in the onboarding session)

## integration evidence

- RabbitMQ Orders order-created consumer confirmed via src/leads/integrations/orders-order-created-broker-adapter.service.ts
- Redis declared optional in .env.example but not referenced anywhere in src/, supporting the not-applicable decision
- auth/logging/notifications/AI integrations confirmed via SYSTEM.md's documented integration table

## invariant evidence

LEADS-INV-001..005 are drawn directly from BUSINESS.md (Constraints), SYSTEM.md (item limits), and STATE.json/TASKS.md (open replay/backfill blocker) without alteration.

## sensitive-data evidence

No secrets, tokens, or lead PII appear in any adoption artifact; only architectural facts and non-secret configuration variable names are referenced.

## replay and determinism evidence

The pre-existing open replay/backfill validation gap for Orders order-created events is documented as-is and not resolved by this bootstrap.

## issues and validation debt

No new validation debt was created. The pre-existing docs/orchestrator/VALIDATION_DEBT.md template contained only placeholder rows; it has been replaced with a clean ledger reflecting no active entries.

## deviations

None; scope was limited to the documentation adoption baseline as directed.

## recommendation

Approve for planning phase. Deployment-phase (implementation) validation is not required for a documentation-only onboarding.

## traceability confirmation

This validation confirms the traceability chain `TASK-001-bootstrap-service` -> `../22_goal_impact/GOAL-IMPACT-TASK-001.md` -> `EP-TASK-001-bootstrap-service.md` -> `VAL-TASK-001-bootstrap-service.md` is intact and evidenced.
