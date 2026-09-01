# leads-microservice — Legacy STATE.json Archive

## Migrated 2026-09-01 — STATE.json legacy mirror archive

Archived verbatim from STATE.json's legacy mirror block prior to removal during the ecosystem-wide Wave-projection-only STATE.json standardization. Actionable blocker/follow-up items were also copied into TASKS.md.

```json
{
  "schemaVersion": 1,
  "project": "leads-microservice",
  "lifecycle": "active",
  "health": "healthy",
  "activeTask": "None active; next focus is defining and validating the replay/backfill source for missed Orders order-created events",
  "lastUpdated": "2026-08-30",
  "deployment": {
    "status": "commit-triggered-auto-queue",
    "image": null,
    "revision": null
  },
  "blockers": [
    "Replay/backfill validation source for missed Orders order-created events is not yet defined"
  ],
  "followUps": [
    "Define and validate replay/backfill source for missed Orders events; live consumer is enabled only for new explicit lead-attribution events",
    "IPS adoption profile completed 2026-08-30; run the planning validator before further scope changes"
  ]
}
```
