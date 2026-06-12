# Leads Orchestrator Master Prompt

You are working on `leads-microservice`, the consent-aware non-registered lead intake service for the Statex ecosystem.

## Preserved Intent

Leads exists to collect contact submissions without registration, preserve consent and source evidence, support human-reviewed follow-up, and integrate with logging, notifications, CRM, and AI analysis without exposing raw lead data or taking over campaign execution.

## Non-Negotiable Boundaries

- Leads owns non-registered lead records, contact methods, submissions, confirmations, preferences, and unsubscribe state.
- Auth owns registered-user identity, JWTs, RBAC, and registered-user consent.
- Notifications owns delivery mechanics and provider credentials.
- Marketing owns campaign execution and mass outreach policy.
- Logging owns centralized log storage.
- AI microservice may analyze only owner-approved, minimized or redacted lead context.
- Raw production lead data, contact details, confirmation tokens, private URLs, and secrets must not enter docs, prompts, tests, or validation reports.
- No mass outreach may run without human review.
- Public intake must remain validated and bounded.

## Required Workflow For Every Session

1. Work on the remote repository at `/home/ssf/Documents/Github/leads-microservice` on `alfares`.
2. Read `BUSINESS.md`, `SYSTEM.md`, `AGENTS.md`, `TASKS.md`, `STATE.json`, `docs/IMPLEMENTATION_STATE.md`, and this orchestrator pack.
3. Query DocsRAG before broad architecture or ecosystem work when credentials are available; record when unavailable.
4. Identify the active goal in `docs/IMPLEMENTATION_STATE.md` or the earliest active/pending goal in `docs/orchestrator/GOALS.md`, unless the owner selects another goal.
5. Restate the preserved intent and affected ownership boundary.
6. Fill the execution plan, context package, invariant review, sensitive-data classification, consent impact, contract impact, replay/determinism plan, and validation plan.
7. Run the pre-coding gate before source edits.
8. Implement only the selected chunk.
9. Run readiness checks and append evidence to `docs/orchestrator/STATUS.md`.
10. Update continuation state before ending.

## Completion Standard

A goal is complete only when:

- its acceptance criteria are met by docs, code, tests, or explicit runtime evidence;
- invariant and sensitive-data evidence is recorded;
- consent and contract impact are recorded;
- validation commands are recorded with pass/fail summaries;
- `docs/IMPLEMENTATION_STATE.md`, `TASKS.md`, and `STATE.json` reflect the current state when applicable;
- the next action is concrete.

## Stop Conditions

Stop and record a blocker when:

- raw lead export is requested without explicit approval;
- mass outreach is requested without human review;
- consent or unsubscribe behavior is unclear;
- internal-service trust boundaries are ambiguous;
- validation would require production lead mutation without approval;
- secrets or contact data would be printed or persisted.
