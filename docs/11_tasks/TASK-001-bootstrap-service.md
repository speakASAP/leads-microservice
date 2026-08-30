# Task: Leads Microservice IPS adoption bootstrap

```yaml
id: TASK-001-bootstrap-service
status: validated
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - ../00_constitution/CONSTITUTION.md
  - ../01_vision/VISION.md
downstream:
  - ../21_execution_plans/EP-TASK-001-bootstrap-service.md
  - ../22_goal_impact/GOAL-IMPACT-TASK-001.md
  - ../12_validation/VAL-TASK-001-bootstrap-service.md
```

## objective

Bring the leads-microservice repository into full compliance with the IPS project-adoption standard: complete all required root and docs/ artifacts, integration review, and state files without fabricating product intent beyond what is already documented in BUSINESS.md, SYSTEM.md, README.md, AGENTS.md, TASKS.md, and STATE.json.

## upstream links

- `../00_constitution/CONSTITUTION.md`
- `../01_vision/VISION.md`
- `../../BUSINESS.md`

## goal impact

See `../22_goal_impact/GOAL-IMPACT-TASK-001.md` for the full contribution mapping to approved project goals.

## project invariant impact

This task does not change LEADS-INV-001..005; it documents them formally in docs/17_governance/PROJECT_INVARIANTS.md for the first time.

## sensitive-data classification

No secrets, lead PII, or production data are included in any adoption artifact; all content is architectural/process documentation drawn from non-secret repository files.

## contract and schema impact

No API, database schema, or public contract changes. This is a documentation-only bootstrap.

## replay and determinism impact

This task documents, but does not resolve, the existing open replay/backfill validation blocker for Orders order-created events; no code affecting replay/determinism is changed.

## scope

- Root IPS artifacts (README, BUSINESS, SYSTEM, AGENTS, AGENT_OPERATIONS, CLAUDE, TASKS, STATE.json, ips-adoption.json)
- Protected governance docs (CONSTITUTION, VISION, PROJECT_INVARIANTS)
- Bootstrap task chain (TASK-001, GOAL-IMPACT-TASK-001, EP-TASK-001, VAL-TASK-001)
- Integration contract and capability review

## non-goals

- Changing any running service behavior, schema, or deployment configuration
- Resolving the open Orders order-created replay/backfill blocker as part of this task
- Modifying docs/orchestrator/* migration-pack content

## acceptance criteria

- The IPS planning validator passes with no unresolved findings for leads-microservice
- All 16 integration capabilities have concrete required/not-applicable decisions grounded in observed repo facts
- Protected docs (BUSINESS, CONSTITUTION, VISION) carry human-approval evidence
- STATE.json and TASKS.md reflect the real current state, including the open replay/backfill blocker

## required context

- README.md, BUSINESS.md, SYSTEM.md, AGENTS.md, AGENT_OPERATIONS.md, TASKS.md, STATE.json (pre-existing real content)
- .env.example for integration facts
- src/leads/integrations/orders-order-created-broker-adapter.service.ts for confirming RabbitMQ usage

## validation task

Run `python3 ../intent-preservation-system/scripts/validate_adoption_profile.py --root . --phase planning` from the ecosystem root and confirm a clean pass.

## required gates

- IPS adoption planning validator exits 0
- No placeholder markers remain in any artifact

## parallel workstream context

This is a single-owner documentation bootstrap with no parallel workstreams; it does not touch the Orders event consumer code or the open replay/backfill blocker.
