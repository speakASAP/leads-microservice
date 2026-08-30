# Goal Impact: Leads Microservice IPS adoption bootstrap

```yaml
id: GOAL-IMPACT-TASK-001
status: validated
owner: project owner
created: 2026-08-30
last_updated: 2026-08-30
completeness_level: validated
upstream:
  - ../11_tasks/TASK-001-bootstrap-service.md
downstream:
  - ../21_execution_plans/EP-TASK-001-bootstrap-service.md
```

## goal

Bring leads-microservice into full IPS adoption compliance, matching the standard already applied to cv-tuning, runlayer, and wisdom-quotes.

## contribution

Completing the adoption profile makes leads-microservice's GDPR constraints, Orders-event attribution boundary, and integration decisions explicit and machine-checkable, reducing drift risk as the replay/backfill blocker is eventually resolved.

## success metric

- IPS planning validator passes for leads-microservice with zero errors
- All 16 capabilities reviewed with concrete decisions

## invariant compatibility

Fully compatible; this task formalizes existing invariants (LEADS-INV-001..005) without changing them.

## upstream and downstream links

- Upstream task: `../11_tasks/TASK-001-bootstrap-service.md`
- Downstream execution plan: `../21_execution_plans/EP-TASK-001-bootstrap-service.md`

## validation method

The goal is complete once the IPS planning validator passes without unresolved placeholders or missing required sections, and the commit is recorded on main.
