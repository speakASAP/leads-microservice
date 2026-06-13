# Goal 11 Contracts - CRM Boundary, Minimal Schema, And Safe Read/Reveal

```yaml
id: LEADS-GOAL-11-CRM-BOUNDARY
status: approved
owner: leads-owner
created: 2026-06-13
last_updated: 2026-06-13
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.contracts.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.auth-admin-access.md
  - GOAL-11-ecosystem-lead-lifecycle-contracts.marketing-eligibility.md
  - ../docs/orchestrator/INTENT.md
  - ../docs/orchestrator/PROJECT_INVARIANTS.md
downstream:
  - future crm-microservice execution plans
  - future leads safe-read/reveal execution plans
```

## Purpose

Define when CRM should become a separate service, what it should own, the minimum schema it needs, and how it may safely read or reveal Leads data without turning Leads into a CRM or raw export service.

This is a contract artifact only. It does not create a CRM service or change Leads runtime behavior.

## Source Context

DocsRAG retrieval for CRM/Leads boundaries returned HTTP 200 from the in-cluster Leads runtime pod. Retrieved context reinforced:

- Leads owns non-registered lead records, contact methods, submissions, confirmations, preferences, and unsubscribe state.
- Raw lead data export requires owner approval.
- No mass outreach may occur without human review.
- Marketing owns campaign orchestration and outcomes.
- Notifications owns provider dispatch.
- Auth owns registered-user identity and consent.
- No direct database writes are allowed across service boundaries.

Token values were not printed.

## Core Decision

CRM should be a separate service once funnel workflow becomes a runtime domain. Leads may keep CRM-lite masked admin views temporarily, but Leads must not absorb CRM ownership.

CRM owns relationship workflow. Leads owns evidence.

## Ownership Boundary

| Capability | Owner |
| --- | --- |
| Non-registered lead intake, contact methods, submissions, confirmation, preferences, unsubscribe, consent evidence | `leads-microservice` |
| Funnel definitions, stages, tasks, notes, assignments, opportunity workflow, campaign membership review | future `crm-microservice` |
| Registered-user identity, workspace membership, RBAC, verified lead-to-user linking | `auth-microservice` |
| Campaigns, segment execution, approvals, schedules, delivery outcomes | `marketing-microservice` |
| Provider delivery and channel registry | `notifications-microservice` |
| Paid-customer facts, subscriptions, entitlements | billing/orders/payment owner |
| Central log storage | `logging-microservice` |

CRM must not own raw lead intake, consent source, consent timestamp, unsubscribe source of truth, confirmation tokens, notification providers, campaign sending, registered identity, or payment state.

## When To Create `crm-microservice`

Create CRM as a separate service when at least one of these becomes active runtime scope:

- custom funnel definitions;
- pipeline stages per tenant or product;
- lead owner assignment;
- sales/operator tasks;
- notes and activities;
- opportunity/deal records;
- campaign membership review;
- tenant workspace dashboards;
- lead-to-user/customer conversion workflow;
- reporting across sources and products;
- audit workflow for contact reveal or campaign membership.

Before that, CRM-lite may remain inside Leads admin only as masked operational view and one-lead review shell.

## CRM Minimal Schema

Initial CRM service should store workflow references and derived/minimized context, not raw lead payloads.

### `CrmLeadProfile`

Purpose: CRM-side workflow profile referencing Leads evidence.

Fields:

- `id`
- `workspaceId`
- `leadId`
- `sourceService`
- `sourceLabel`
- `sourceHost`
- `status`
- `score`
- `scoreReasons`
- `assignedOwnerId`
- `createdAt`
- `updatedAt`

Do not store contact values, raw messages, confirmation tokens, or private source URLs by default.

### `Pipeline`

Fields:

- `id`
- `workspaceId`
- `name`
- `description`
- `createdAt`
- `updatedAt`

### `FunnelStage`

Fields:

- `id`
- `pipelineId`
- `name`
- `order`
- `stageType`
- `entryCriteria`
- `exitCriteria`

### `Opportunity`

Fields:

- `id`
- `workspaceId`
- `crmLeadProfileId`
- `pipelineId`
- `stageId`
- `valueEstimate`
- `currency`
- `probability`
- `status`
- `expectedCloseAt`
- `createdAt`
- `updatedAt`

### `Task`

Fields:

- `id`
- `workspaceId`
- `crmLeadProfileId`
- `assignedToUserId`
- `type`
- `title`
- `dueAt`
- `status`
- `createdAt`
- `updatedAt`

### `Note`

Fields:

- `id`
- `workspaceId`
- `crmLeadProfileId`
- `authorUserId`
- `body`
- `visibility`
- `createdAt`

Note rule: notes must not copy raw contact values, raw lead messages, secrets, confirmation tokens, or private URLs.

### `Activity`

Fields:

- `id`
- `workspaceId`
- `crmLeadProfileId`
- `type`
- `actorUserId`
- `sourceService`
- `occurredAt`
- `summary`
- `metadata`

Metadata must be minimized and schema-controlled.

### `CampaignMembership`

Fields:

- `id`
- `workspaceId`
- `crmLeadProfileId`
- `campaignId`
- `status`
- `reviewedByUserId`
- `reviewedAt`
- `eligibilitySnapshot`

Eligibility snapshot stores reason codes and booleans, not contact values.

### `ConversionEvent`

Fields:

- `id`
- `workspaceId`
- `crmLeadProfileId`
- `leadId`
- `userId`
- `eventType`
- `sourceService`
- `occurredAt`

CRM records conversion workflow; Auth/Billing remain source of identity and payment facts.

## Safe Read Contract From Leads To CRM

CRM should read minimized or masked context by default.

Recommended endpoint:

```http
POST /api/leads/internal/crm-context
```

Request:

```json
{
  "leadIds": ["uuid"],
  "workspaceId": "workspace-id",
  "purpose": "crm_review"
}
```

Response:

```json
{
  "items": [
    {
      "leadId": "uuid",
      "status": "new",
      "sourceService": "shop-assistant",
      "sourceLabel": "pricing-interest",
      "sourceHost": "example.com",
      "messageLength": 120,
      "contactMethodTypes": ["email"],
      "contactMethodCount": 1,
      "preferredChannel": "email",
      "fallbackChannelCount": 0,
      "marketingConsent": true,
      "consentEvidencePresent": true,
      "confirmed": false,
      "unsubscribed": false,
      "createdAt": "2026-06-13T00:00:00.000Z",
      "updatedAt": "2026-06-13T00:00:00.000Z"
    }
  ]
}
```

Default CRM context must not include:

- contact method values;
- raw message;
- metadata values;
- confirmation tokens;
- private source URL path/query;
- raw submission payload.

## Safe Reveal Contract

CRM may request contact reveal only for a specific lead, purpose, actor, and workflow step.

Recommended endpoint:

```http
POST /api/leads/internal/crm-contact-reveal
```

Request:

```json
{
  "leadId": "uuid",
  "workspaceId": "workspace-id",
  "actorUserId": "auth-user-id",
  "purpose": "manual_follow_up",
  "workflowReference": "task-id",
  "channel": "email"
}
```

Rules:

- Reveal must be one lead at a time by default.
- Caller must be trusted CRM service.
- Actor must have Auth-backed permission through CRM/Auth.
- Leads must verify consent/unsubscribe state where the purpose involves marketing or follow-up.
- Leads returns only the contact value needed for the requested channel.
- Leads audits the reveal without logging the contact value.
- Leads must not return raw message, confirmation token, private URL path/query, or metadata values.

Response:

```json
{
  "leadId": "uuid",
  "channel": "email",
  "revealed": true,
  "expiresAt": "2026-06-13T00:15:00.000Z"
}
```

Implementation note: the actual contact value should be returned only over the secured service channel and must never be logged or copied into validation docs.

## CRM To Marketing Handoff

CRM may propose campaign membership; Marketing owns final campaign approval and execution.

CRM handoff payload to Marketing should include:

- `campaignId`
- `crmLeadProfileIds`
- `leadIds`
- `workspaceId`
- `reviewedByUserId`
- `reviewedAt`
- `reviewStatus`
- eligibility reason snapshot, if available

CRM must not send contact values to Marketing as part of membership proposal. Marketing must use Leads eligibility and post-approval contact resolution.

## CRM To Auth/Billing Conversion Linkage

CRM may record conversion workflow but must not own source facts.

Rules:

- Auth emits or verifies lead-to-user linkage.
- Billing/payment owner emits paid-customer facts.
- CRM records `ConversionEvent` references for workflow and reporting.
- Leads may store conversion reference metadata, not identity ownership.

## Audit Requirements

CRM actions requiring audit:

- lead profile creation from lead event;
- assignment changes;
- stage changes;
- task creation/completion;
- note creation;
- campaign membership review;
- contact reveal request;
- contact reveal result;
- conversion event recording.

Audit metadata may include:

- actor user ID;
- workspace ID;
- CRM entity ID;
- lead ID;
- action name;
- purpose;
- timestamp;
- result status;
- reason codes.

Audit metadata must not include:

- contact values;
- raw lead messages;
- confirmation tokens;
- full JWTs;
- private source URLs;
- arbitrary lead metadata values.

## Failure Behavior

Recommended behavior:

- `401`: missing or invalid trusted service authentication.
- `403`: CRM not trusted, actor lacks permission, tenant mismatch, or purpose disallowed.
- `404`: lead not visible in tenant scope.
- `409`: reveal already processed, stale workflow state, or conflicting assignment.
- `422`: invalid purpose/channel/workflow reference.

Tenant-hidden records should not leak existence.

## Runtime Implementation Order

1. Keep CRM-lite in Leads admin as masked view until CRM service is approved.
2. Define CRM service repository and IPS/orchestrator pack.
3. Implement CRM schema for minimized workflow references.
4. Add Leads `crm-context` builder tests using synthetic leads.
5. Add guarded CRM context endpoint returning minimized context only.
6. Add CRM profile ingestion from minimized Lead events.
7. Add CRM contact reveal request flow only after Auth/CRM permissions and audit are implemented.
8. Add Marketing handoff from CRM membership review.
9. Add conversion event references from Auth/Billing facts.

## Non-Goals

- No runtime code change in this contract chunk.
- No CRM service scaffold in this chunk.
- No raw lead export.
- No campaign send execution.
- No direct database reads/writes across service boundaries.
- No contact values in docs, logs, tests, prompts, or validation output.
- No payment, Auth, Marketing, Notifications, or AI ownership moved into Leads or CRM.
