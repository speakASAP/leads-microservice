# Goal 24 Replay Contract - Internal Lifecycle Event Replay Consumers

```yaml
id: LEADS-GOAL-24-REPLAY-CONTRACT
status: active
owner: Agent C
created: 2026-06-13
last_updated: 2026-06-13
contract_version: 2026-06-13.lifecycle-replay.v1
upstream:
  - GOAL-11-ecosystem-lead-lifecycle-contracts.contracts.md
  - GOAL-18-durable-lifecycle-event-storage.md
downstream:
  - ../src/leads/integrations/lifecycle-replay-contract.ts
```

## Purpose

Trusted internal consumers sometimes need to replay minimized lifecycle evidence for reconciliation, incident replay, consent audit, or conversion linkage recovery. Leads may serve its own minimized lifecycle evidence, but Logging remains the centralized log owner.

## Guard Requirements For Future Runtime Use

Any runtime endpoint based on this contract must require trusted internal-service authentication and must be serialized with guarded API changes. The first consumer and route shape require owner selection before runtime implementation.

## Request Shape

```json
{
  "leadId": "lead-id",
  "consumer": "marketing",
  "purpose": "consumer_reconciliation",
  "requestedAt": "2026-06-13T00:00:00.000Z",
  "limit": 30,
  "fromOccurredAt": "2026-06-13T00:00:00.000Z",
  "toOccurredAt": "2026-06-13T01:00:00.000Z"
}
```

Rules: `consumer` is one of `auth`, `crm`, `marketing`, `logging-analytics`, or `product-apps`; `purpose` is one of `consumer_reconciliation`, `incident_replay`, `consent_audit`, or `conversion_linkage_replay`; `limit` is clamped to `1..30`; replay is one-lead scoped.

## Response Shape

```json
{
  "contractVersion": "2026-06-13.lifecycle-replay.v1",
  "leadId": "lead-id",
  "consumer": "marketing",
  "purpose": "consumer_reconciliation",
  "dataClass": "minimized",
  "evidenceOwner": "leads-microservice",
  "centralizedLogOwner": "logging-microservice",
  "constraints": {
    "guardRequired": true,
    "maxEvents": 30,
    "oneLeadScoped": true,
    "contactValuesIncluded": false,
    "rawMessagesIncluded": false,
    "campaignExecutionAllowed": false,
    "notificationDispatchAllowed": false
  },
  "bounds": { "limit": 30, "eventCount": 1 },
  "events": []
}
```

## Payload Minimization

Known event payloads are replayed through allow lists only:

- `LeadSubmitted`: status, source service/label/host, contact method types/count, channel counts, marketing consent state, consent evidence presence, confirmation/unsubscribe booleans, created timestamp.
- `LeadConfirmed`: source service and confirmation timestamp.
- `LeadPreferenceUpdated`: marketing consent state, consent evidence presence, channel counts, unsubscribe timestamp, updated timestamp.
- `LeadConvertedToUser`: Auth user reference, source service, link method, linked timestamp.

Unknown event payloads must be replayed with an empty payload object because arbitrary stored JSON cannot be proven minimized.

## Forbidden Data

Replay payloads, docs, tests, logs, and validation evidence must omit contact values, raw messages, confirmation tokens, private source URL path/query values, metadata values, raw consent source values, JWTs, session tokens, campaign content, secrets, and raw production lead rows.

## Ownership Constraints

Leads owns non-registered lifecycle evidence. Logging owns centralized log storage and analytics log history. Marketing owns campaign policy and execution. Notifications owns delivery mechanics. Auth owns identity and registered-user claims. CRM owns workflow after it consumes minimized evidence.
