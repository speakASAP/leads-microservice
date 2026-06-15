# Goal 25 - Marketing Approval Evidence Handoff Contract: Coding Prompt

Implement Goal 25 in the remote `leads-microservice` repo only.

Preserve Leads as the consent-aware non-registered lead intake, consent, preference, confirmation, unsubscribe, and guarded contact-resolution owner. Marketing owns campaign approval storage, campaign content, audience decisions, execution, and outcomes. Notifications owns delivery mechanics.

Tasks:

1. Add a focused Marketing approval evidence helper/builder with bounded purpose codes, retention expectations, required field validation, and an audit-safe summary that omits contact values, campaign content, raw messages, confirmation tokens, private URLs, raw consent source values, and metadata values.
2. Update the guarded contact-resolution DTO/service so `approved_campaign_send` requires structured approval evidence, exactly one requested channel, channel match with approval evidence, and eligibility re-check before returning contact values.
3. Add focused tests using synthetic data only. Tests must prove no campaign content or contact export is added to approval summaries/log metadata.
4. Validate focused tests, build, and sensitive-data scans.

Non-goals: no campaign execution, no outbound sends, no Notifications dispatch, no approval storage in Leads, no Prisma schema/migration, no production lead mutation, no AI/CRM export, no deployment.
