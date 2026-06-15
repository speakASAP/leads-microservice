# Goal 22 Execution Plan

Goal: Production Auth Workspace Token Matrix Validation.

Chunks:

- 22.1 Create execution artifacts and pass the pre-coding gate: complete.
- 22.2 Validate unauthenticated and invalid-token admin rejection: complete.
- 22.3 Validate global superadmin platform-wide read with masked outputs only: blocked; no currently accepted non-mutating token candidate was available.
- 22.4 Validate non-global workspace source scoping when approved tokens are available: blocked; owner-approved scoped tokens are not available.
- 22.5 Record evidence without secrets or raw production data: complete for executed checks.

Gate: Leads pre-coding gate
Date: 2026-06-13
Goal: Goal 22 - Production Auth Workspace Token Matrix Validation
Chunk: 22.1-22.5
Repository root: `/home/ssf/Documents/Github/leads-microservice`
Git status: dirty before this worker; unrelated Goal 21/source/orchestrator changes already existed and were not reverted.
DocsRAG query: attempted from the in-cluster Leads runtime pod; HTTP 500; token value was not printed.
Execution plan: this file.
Context package: `implementation-goals/GOAL-22-production-auth-workspace-token-matrix-validation.context-package.md`
Coding prompt: `implementation-goals/GOAL-22-production-auth-workspace-token-matrix-validation.coding-prompt.md`
Invariants checked: Auth owns identity/RBAC; Leads owns masked admin views and source scoping; no raw lead export; no outreach; no production mutation.
Sensitive-data classification: sensitive, with masked/minimized evidence only.
Consent impact: none; no consent semantics, unsubscribe, confirmation, or production lead state changed.
Contract/schema impact: no Leads API, Auth API, schema, deployment, or runtime config change.
AI/CRM export impact: none.
Outreach impact: none.
Validation commands: health smoke, admin unauthorized smoke, invalid-token smoke, DocsRAG status check, existing-token candidate validation, documentation scans.
Result: pass-with-documented-blockers.

Validation sequence:

1. Read project/orchestrator docs and Goal 19/20 auth artifacts.
2. Query DocsRAG from the in-cluster Leads pod without printing the token.
3. Run health and admin rejection smoke checks using HTTP status only.
4. Check existing Kubernetes token candidates in memory only, recording presence and Auth status only.
5. Do not mint a fresh Auth token or call production login endpoints.
6. Write masked validation evidence and blocker requirements.

Blockers:

- Positive global admin read requires a currently valid already-issued global admin token or explicit owner approval for a non-mutating synthetic path.
- Non-global source scoping requires owner-provided valid workspace/app-scoped admin tokens or approved synthetic staging tokens.
- Production Auth login with stored credentials requires explicit owner approval because it can mutate production Auth login/session/audit state.
