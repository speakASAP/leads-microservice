# Goal 22 Execution Plan

Goal: Production Auth Workspace Token Matrix Validation.

Chunks:

- 22.1 Create execution artifacts and pass the pre-coding gate: complete.
- 22.2 Validate unauthenticated and invalid-token admin rejection: complete.
- 22.3 Validate global superadmin platform-wide read with masked outputs only: complete.
- 22.4 Validate non-global workspace/app-role source scoping with approved token path: complete.
- 22.5 Record evidence without secrets or raw production data: complete.

Gate: Leads pre-coding gate
Date: 2026-06-15 update after owner approval
Goal: Goal 22 - Production Auth Workspace Token Matrix Validation
Repository root: `/home/ssf/Documents/Github/leads-microservice`
DocsRAG query: attempted from the in-cluster Leads runtime pod; HTTP 500; token value was not printed.
Execution plan: this file.
Context package: `implementation-goals/GOAL-22-production-auth-workspace-token-matrix-validation.context-package.md`
Coding prompt: `implementation-goals/GOAL-22-production-auth-workspace-token-matrix-validation.coding-prompt.md`
Invariants checked: Auth owns identity/RBAC; Leads owns masked admin views and source scoping; no raw lead export; no outreach; no production lead mutation.
Sensitive-data classification: sensitive, with masked/minimized evidence only.
Consent impact: none; no consent semantics, unsubscribe, confirmation, or production lead state changed.
Contract/schema impact: no Leads API, Auth API, schema, deployment, or runtime config change.
AI/CRM export impact: none.
Outreach impact: none.
Validation commands: health smoke, admin unauthorized smoke, invalid-token smoke, DocsRAG status check, live scope-map metadata check, owner-approved synthetic Auth token matrix smoke, documentation updates.
Result: pass.

Validation sequence:

1. Read project/orchestrator docs and Goal 19/20 auth artifacts.
2. Query DocsRAG from the in-cluster Leads pod without printing the token.
3. Preserve prior health and admin rejection smoke evidence.
4. Inspect Auth repo and deployed Leads scope-map metadata to choose a valid non-global app-role path.
5. Run owner-approved synthetic Auth validation inside the Auth pod, keeping token/password values in memory only.
6. Validate live Auth token classes and deployed Leads admin summary/list paths with masked output only.
7. Remove synthetic Auth validation users.
8. Write masked validation evidence and completion state.

Blockers:

- None for Goal 22 after owner approval and successful masked positive validation.
