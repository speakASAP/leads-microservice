# Goal 25 - Marketing Approval Evidence Handoff Contract: Coding Prompt

Implement Goal 25 in the remote `leads-microservice` repo only.

Preserve Leads as the consent-aware non-registered lead intake, consent, preference, confirmation, unsubscribe, and guarded contact-resolution owner. Marketing owns campaign approval storage, campaign content, audience decisions, execution, and outcomes. Notifications owns delivery mechanics.

Tasks:

1. Add a focused Marketing approval evidence helper/builder with bounded purpose codes, retention expectations, required field validation, and an audit-safe summary that omits contact values, campaign content, raw messages, confirmation tokens, private URLs, raw consent source values, and metadata values.
2. Update the guarded contact-resolution DTO/service so `approved_campaign_send` requires structured approval evidence, exactly one requested channel, channel match with approval evidence, and eligibility re-check before returning contact values.
3. Add focused tests using synthetic data only. Tests must prove no campaign content or contact export is added to approval summaries/log metadata.
4. Validate focused tests, build, and sensitive-data scans.

Non-goals: no campaign execution, no outbound sends, no Notifications dispatch, no approval storage in Leads, no Prisma schema/migration, no production lead mutation, no AI/CRM export, no deployment.

## 2026-06-15 Follow-Up Coding Prompt

Implement only the owner-approved Leads-owned minimized approval evidence storage follow-up.

Allowed changes:

- Prisma schema/migration for one dedicated approval-evidence reference table.
- Marketing approval evidence helper validation/storage builder and focused tests.
- Contact-resolution service persistence after structured approval evidence passes validation and eligibility is re-checked.
- Goal 25 artifacts and shared status evidence.

Required behavior:

- Store only minimized Marketing approval references and audit summary fields.
- Do not store contact values, campaign content, raw messages, confirmation tokens, raw consent source values, private URLs, metadata values, approver values, workspace values, or content-version values.
- Do not execute campaigns, send notifications, export raw contacts, mutate production leads, or deploy.
- Preserve Marketing ownership of approval records, content, audience decisions, execution jobs, and delivery outcomes.
- Block final integration if concurrent Goal 24 source breaks build or requires schema work.
