# Goal 6 - Operational Smoke And Documentation Ingestion: Coding Prompt

```yaml
id: LEADS-GOAL-06-CODING-PROMPT
status: complete
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
completeness_level: complete
upstream:
  - GOAL-06-operational-smoke-and-documentation-ingestion.context-package.md
  - GOAL-06-operational-smoke-and-documentation-ingestion.execution-plan.md
downstream:
  - GOAL-06-operational-smoke-and-documentation-ingestion.validation-report.md
```

## Task Summary

Complete Goal 6 by recording build, test, production health, DocsRAG ingestion, and DocsRAG retrieval evidence. This is documentation/state work only.

## Allowed Changes

- Add Goal 6 implementation artifacts.
- Update orchestrator status and continuation state.
- Mark Goal 6 complete after evidence is recorded.

## Forbidden Changes

- Do not deploy.
- Do not mutate production leads.
- Do not retrieve or export raw lead rows.
- Do not print or persist secrets, contact details, raw messages, confirmation tokens, private URLs, CRM records, or production payloads.
- Do not alter runtime source behavior.

## Implementation Instructions

1. Run the pre-coding gate.
2. Run build and full tests.
3. Verify public health.
4. Trigger DocsRAG ingestion from the Leads runtime pod without printing the token.
5. Verify retrieval returns current Leads IPS/Goal docs.
6. Run documentation scans.
7. Update Goal 6 artifacts, status, and continuation state.

## Acceptance Criteria

- Build/test evidence is recorded.
- Production health evidence is recorded.
- DocsRAG ingestion and retrieval evidence is recorded.
- Sensitive-data handling is recorded.
- All current orchestrator goals are complete.

## Validation Commands

Build, full tests, public health curl, DocsRAG ingestion trigger, DocsRAG retrieval, documentation presence scan, missing-marker scan, and secret-pattern scan.
