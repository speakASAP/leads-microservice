# Leads Intent Preservation

```yaml
id: LEADS-INTENT
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - ../../BUSINESS.md
  - ../../SYSTEM.md
  - ../../TASKS.md
  - ../../STATE.json
downstream:
  - GOALS.md
  - PROJECT_INVARIANTS.md
  - PRE_CODING_GATE.md
```

## Original Intent

Leads is the intake service for contact submissions that do not require registration. It must collect lead messages and contact methods from approved consumer services, preserve consent evidence for GDPR-sensitive communication, support follow-up through CRM and AI-assisted analysis, and integrate with logging and notifications without turning into the owner of registered-user identity, campaign execution, or outbound mass outreach.

## Preserved Intent

Leads must remain a consent-aware, privacy-safe lead intake and preference service:

- accept and store contact submissions with source, message, contact methods, and consent context;
- keep contact and consent evidence available for human-reviewed follow-up;
- send confirmations through notifications-microservice when configured;
- expose bounded query and internal preference APIs for trusted services;
- avoid exporting raw lead data, triggering mass outreach, or bypassing human review.

## Intent Preservation Rules

1. Leads owns non-registered lead intake records, lead contact methods, lead submissions, lead confirmation state, lead preference state, and unsubscribe state.
2. Auth owns registered-user identity, login, JWTs, RBAC, registered-user profiles, and registered-user consent.
3. Notifications owns outbound sending mechanics. Leads may request confirmation or follow-up messages, but it must not become the delivery engine.
4. Marketing owns campaign execution. Leads must not initiate mass outreach without explicit human review.
5. AI analysis must not receive raw lead data unless the owner explicitly approves that exact task and the data handling plan.
6. Every stored lead must preserve consent fields when supplied and must not weaken GDPR evidence.
7. Public intake must stay bounded and validated. List and internal preference APIs must remain controlled.
8. Secrets, service tokens, raw production lead rows, real contact details, confirmation tokens, and private URLs must not be written into docs, prompts, test fixtures, or reports.
9. Every implementation task must record upstream intent, invariant impact, sensitive-data classification, contract impact, validation evidence, and next state.

## Drift Checks

Before any change, ask:

- Does this preserve Leads as the non-registered lead intake and preference service?
- Does this accidentally move registered-user identity, notification delivery, campaign policy, logging storage, or database infrastructure ownership into Leads?
- Does this weaken consent capture, unsubscribe behavior, or confirmation evidence?
- Does this expose raw lead data, contact details, tokens, secrets, or production payloads?
- Does this increase outreach automation without human review?
- Does this preserve API limits, validation, and trusted-service boundaries?

## Immutable Intent Boundary

AI agents may clarify or link this intent, but must not weaken it. Human owner approval is required before changing:

- Leads ownership of non-registered lead records, submissions, contact methods, confirmation, preferences, and unsubscribe state.
- Leads non-ownership of registered-user identity, campaign execution, notification delivery, logging storage, database infrastructure, gateway routing, and AI model ownership.
- The rules against raw lead data export, mass outreach without review, and secret or contact-data leakage in docs or prompts.

If implementation pressure conflicts with this section, stop coding and append the conflict to `docs/orchestrator/STATUS.md`.
