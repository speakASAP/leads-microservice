# Goal 17 Coding Prompt

Implement controlled contact resolution only:

- Guard with `InternalServiceGuard`.
- Resolve one `leadId` per request.
- Require `approvalId` for `approved_campaign_send`.
- Re-check campaign eligibility before campaign-send contact resolution.
- Return only requested channel contact values.
- Never log returned contact values.
- Do not add campaign execution, batch export, schema changes, Notifications dispatch, AI/CRM export, production mutation, or deployment.
