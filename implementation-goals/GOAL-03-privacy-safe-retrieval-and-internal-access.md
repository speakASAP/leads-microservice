# Goal 3 - Privacy-Safe Retrieval And Internal Access

```yaml
id: LEADS-GOAL-03
status: done
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - ../docs/orchestrator/GOALS.md
  - ../docs/orchestrator/INTENT.md
downstream:
  - GOAL-03-privacy-safe-retrieval-and-internal-access.execution-plan.md
  - GOAL-03-privacy-safe-retrieval-and-internal-access.context-package.md
  - GOAL-03-privacy-safe-retrieval-and-internal-access.coding-prompt.md
  - GOAL-03-privacy-safe-retrieval-and-internal-access.validation-report.md
```

## Intent

Lead retrieval, list, preference, and unsubscribe APIs must expose only the minimum necessary data through controlled paths.

## Selected Chunks

- Chunk 3.1 - Audit `GET /api/leads`, `GET /api/leads/:id`, and internal preference endpoints.
- Chunk 3.2 - Verify or add access controls for non-public lead retrieval.
- Chunk 3.3 - Preserve the max 30 items per list request.
- Chunk 3.4 - Add validation evidence for trusted internal-service headers.

## Acceptance Criteria

- Raw lead retrieval is not public unless owner-approved and documented.
- Internal preference and unsubscribe APIs require the service guard.
- Pagination and bounds remain enforced.
- No raw production lead data appears in logs, docs, prompts, or tests.

## Non-Goals

- No production lead mutation.
- No raw lead data export.
- No outreach automation.
- No Auth, Notifications, Marketing, Logging, database infrastructure, AI, or deployment ownership changes.
- No list limit or timeout increase.
- No schema migration.
