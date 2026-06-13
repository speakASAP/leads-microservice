# Goal 20 Coding Prompt

Implement workspace-scoped admin isolation on top of Goal 19 Auth-backed admin APIs.

Rules:

- Use Auth POST /auth/validate only; do not implement local Auth token issuance or login.
- Preserve full Auth role strings.
- Extract active workspace/tenant claims only if Auth returns them.
- Use LEADS_ADMIN_WORKSPACE_SOURCE_MAP as the Leads-owned mapping from workspace/tenant IDs to sourceService values.
- Fail closed for non-global admins when workspace claim or mapping is missing.
- Keep global:superadmin platform-wide.
- Do not return or log raw contact values, raw messages, confirmation tokens, private URLs/path/query values, metadata values, raw consent source values, bearer tokens, or secrets.
- Do not change internal service guards, public intake, campaign execution, notification behavior, AI/CRM export, or Prisma schema.

