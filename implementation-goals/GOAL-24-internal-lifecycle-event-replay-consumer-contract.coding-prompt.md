# Goal 24 Coding Prompt

Implement only Goal 24 - Internal Lifecycle Event Replay Consumer Contract in `/home/ssf/Documents/Github/leads-microservice` on `alfares`.

Allowed edits:

- `implementation-goals/GOAL-24-*` artifacts.
- lifecycle replay contract builder/types under `src/leads/integrations/`.
- focused lifecycle replay tests.
- append-only/shared status updates after validation.

Requirements:

- One-lead scoped replay request.
- Consumer constrained to existing lifecycle route membership.
- Maximum replay limit 30.
- Deterministic replay output.
- Payload reconstruction through event-type allowlists.
- Explicit Leads evidence owner and Logging centralized log owner fields.
- Omit contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, and campaign content.
- No controller or route changes.

Validation:

- Focused Jest replay contract tests.
- `npm run build`.
- Missing-marker scan.
- Sensitive-pattern scan over Goal 24 files and replay source/tests.
