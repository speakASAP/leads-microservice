# Goal 21 - Sanitized AI/CRM Context API: Context Package

Preserved intent: Leads remains the consent-aware non-registered lead intake and preference service. This slice gives trusted internal consumers a minimized context path so raw lead detail/list APIs are not the default AI/CRM integration surface.

Relevant source:

- `src/leads/integrations/ai-crm-payload.ts` contains the existing sanitized context builder.
- `src/leads/integrations/ai-crm-payload.spec.ts` proves the builder omits contact values, raw messages, confirmation tokens, private URL path/query values, metadata values, and raw consent source values.
- `src/leads/leads.controller.ts` owns guarded internal Leads APIs.
- `src/leads/leads.service.ts` owns lead reads and privacy-safe projections.
- `src/leads/leads.controller.spec.ts` and `src/leads/leads.service.spec.ts` contain focused access-control and sensitive-field tests.

Allowed file scope:

- `src/leads/leads.controller.ts`
- `src/leads/leads.service.ts`
- `src/leads/leads.controller.spec.ts`
- `src/leads/leads.service.spec.ts`
- `docs/orchestrator/GOALS.md`
- `docs/orchestrator/STATUS.md`
- `docs/IMPLEMENTATION_STATE.md`
- `TASKS.md`
- `STATE.json`
- `implementation-goals/GOAL-21-sanitized-ai-crm-context-api*`

Non-goals: no AI client, CRM client, external export, batch export, contact reveal, campaign send, notification dispatch, schema migration, Auth change, public intake change, or deployment.
