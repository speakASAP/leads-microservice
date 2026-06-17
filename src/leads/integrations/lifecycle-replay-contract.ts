import { LeadLifecycleConsumer } from "./lifecycle-event-router.service";

export const LIFECYCLE_REPLAY_CONTRACT_VERSION = "2026-06-13.lifecycle-replay.v1";
export const MAX_LIFECYCLE_REPLAY_EVENTS = 30;

export type LifecycleReplayPurpose =
  | "consumer_reconciliation"
  | "incident_replay"
  | "consent_audit"
  | "conversion_linkage_replay";

export type LifecycleReplayConsumer = LeadLifecycleConsumer | "flipflop-service";

const ROUTED_CONSUMER_BY_REPLAY_CONSUMER: Record<LifecycleReplayConsumer, LeadLifecycleConsumer> = {
  auth: "auth",
  crm: "crm",
  marketing: "marketing",
  "logging-analytics": "logging-analytics",
  "product-apps": "product-apps",
  "flipflop-service": "product-apps",
};

export type LifecycleReplayRequest = {
  leadId: string;
  consumer: LifecycleReplayConsumer;
  purpose: LifecycleReplayPurpose;
  requestedAt?: Date | string | null;
  limit?: number | null;
  fromOccurredAt?: Date | string | null;
  toOccurredAt?: Date | string | null;
};

export type LifecycleReplayRecord = {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: Date | string;
  producer: string;
  leadId: string;
  correlationId?: string | null;
  idempotencyKey?: string | null;
  dataClass?: string | null;
  payload?: unknown;
  consumerRoutes?: string[] | null;
  recordedAt?: Date | string | null;
};

export type LifecycleReplayEvent = {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: string;
  producer: string;
  leadId: string;
  correlationId?: string;
  idempotencyKey?: string;
  dataClass: "minimized";
  payload: Record<string, unknown>;
  consumerRoutes: string[];
  recordedAt: string | null;
};

export type LifecycleReplayResponse = {
  contractVersion: typeof LIFECYCLE_REPLAY_CONTRACT_VERSION;
  leadId: string;
  consumer: LifecycleReplayConsumer;
  purpose: LifecycleReplayPurpose;
  requestedAt: string | null;
  dataClass: "minimized";
  evidenceOwner: "leads-microservice";
  centralizedLogOwner: "logging-microservice";
  constraints: {
    guardRequired: true;
    maxEvents: typeof MAX_LIFECYCLE_REPLAY_EVENTS;
    oneLeadScoped: true;
    contactValuesIncluded: false;
    rawMessagesIncluded: false;
    campaignExecutionAllowed: false;
    notificationDispatchAllowed: false;
  };
  bounds: {
    limit: number;
    eventCount: number;
    fromOccurredAt: string | null;
    toOccurredAt: string | null;
    nextCursor: string | null;
  };
  events: LifecycleReplayEvent[];
};

const ALLOWED_PAYLOAD_FIELDS_BY_EVENT_TYPE: Record<string, string[]> = {
  LeadSubmitted: [
    "leadId",
    "status",
    "sourceService",
    "sourceLabel",
    "sourceHost",
    "contactMethodTypes",
    "contactMethodCount",
    "preferredChannel",
    "fallbackChannelCount",
    "marketingConsent",
    "consentEvidencePresent",
    "confirmed",
    "unsubscribed",
    "createdAt",
  ],
  LeadConfirmed: ["leadId", "sourceService", "confirmedAt"],
  LeadPreferenceUpdated: [
    "leadId",
    "marketingConsent",
    "consentEvidencePresent",
    "preferredChannel",
    "fallbackChannelCount",
    "unsubscribedAt",
    "updatedAt",
  ],
  LeadConvertedToUser: ["leadId", "userId", "sourceService", "linkMethod", "linkedAt"],
};

function toIsoString(value?: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function timestamp(value?: Date | string | null): number | null {
  const iso = toIsoString(value);
  if (!iso) {
    return null;
  }

  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeLifecycleReplayLimit(limit?: number | null): number {
  if (!Number.isFinite(limit ?? NaN)) {
    return MAX_LIFECYCLE_REPLAY_EVENTS;
  }

  return Math.min(MAX_LIFECYCLE_REPLAY_EVENTS, Math.max(1, Math.floor(limit as number)));
}

function recordPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  return payload as Record<string, unknown>;
}

function uniqueSortedStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.filter((item): item is string => typeof item === "string"))).sort();
}

function sanitizePayload(eventType: string, payload: unknown): Record<string, unknown> {
  const allowedFields = ALLOWED_PAYLOAD_FIELDS_BY_EVENT_TYPE[eventType];
  if (!allowedFields) {
    return {};
  }

  const source = recordPayload(payload);
  return allowedFields.reduce<Record<string, unknown>>((result, field) => {
    if (!(field in source)) {
      return result;
    }

    result[field] = field === "contactMethodTypes" ? uniqueSortedStrings(source[field]) : source[field];
    return result;
  }, {});
}

function replayCursor(event: LifecycleReplayEvent): string {
  return `${event.occurredAt}#${event.eventId}`;
}

export function lifecycleRouteConsumerForReplayConsumer(consumer: LifecycleReplayConsumer): LeadLifecycleConsumer {
  return ROUTED_CONSUMER_BY_REPLAY_CONSUMER[consumer];
}

function isRoutedToConsumer(record: LifecycleReplayRecord, consumer: LifecycleReplayConsumer): boolean {
  const routedConsumer = lifecycleRouteConsumerForReplayConsumer(consumer);
  return Array.isArray(record.consumerRoutes) && record.consumerRoutes.includes(routedConsumer);
}

function isWithinTimeBounds(record: LifecycleReplayRecord, request: LifecycleReplayRequest): boolean {
  const occurredAt = timestamp(record.occurredAt);
  if (occurredAt === null) {
    return false;
  }

  const from = timestamp(request.fromOccurredAt);
  const to = timestamp(request.toOccurredAt);

  return (from === null || occurredAt >= from) && (to === null || occurredAt <= to);
}

export function buildLifecycleReplayResponse(
  request: LifecycleReplayRequest,
  records: LifecycleReplayRecord[],
): LifecycleReplayResponse {
  const limit = normalizeLifecycleReplayLimit(request.limit);
  const matchingRecords = records
    .filter((record) => record.leadId === request.leadId)
    .filter((record) => isRoutedToConsumer(record, request.consumer))
    .filter((record) => isWithinTimeBounds(record, request))
    .sort((left, right) => {
      const leftOccurredAt = toIsoString(left.occurredAt) ?? "";
      const rightOccurredAt = toIsoString(right.occurredAt) ?? "";
      return leftOccurredAt.localeCompare(rightOccurredAt) || left.eventId.localeCompare(right.eventId);
    });

  const events = matchingRecords.slice(0, limit).map<LifecycleReplayEvent>((record) => {
    const event: LifecycleReplayEvent = {
      eventId: record.eventId,
      eventType: record.eventType,
      eventVersion: record.eventVersion,
      occurredAt: toIsoString(record.occurredAt) ?? "",
      producer: record.producer,
      leadId: record.leadId,
      dataClass: "minimized",
      payload: sanitizePayload(record.eventType, record.payload),
      consumerRoutes: Array.isArray(record.consumerRoutes) ? [...record.consumerRoutes].sort() : [],
      recordedAt: toIsoString(record.recordedAt),
    };

    if (record.correlationId) {
      event.correlationId = record.correlationId;
    }
    if (record.idempotencyKey) {
      event.idempotencyKey = record.idempotencyKey;
    }

    return event;
  });
  const hasMore = matchingRecords.length > events.length;
  const lastEvent = events[events.length - 1];

  return {
    contractVersion: LIFECYCLE_REPLAY_CONTRACT_VERSION,
    leadId: request.leadId,
    consumer: request.consumer,
    purpose: request.purpose,
    requestedAt: toIsoString(request.requestedAt),
    dataClass: "minimized",
    evidenceOwner: "leads-microservice",
    centralizedLogOwner: "logging-microservice",
    constraints: {
      guardRequired: true,
      maxEvents: MAX_LIFECYCLE_REPLAY_EVENTS,
      oneLeadScoped: true,
      contactValuesIncluded: false,
      rawMessagesIncluded: false,
      campaignExecutionAllowed: false,
      notificationDispatchAllowed: false,
    },
    bounds: {
      limit,
      eventCount: events.length,
      fromOccurredAt: toIsoString(request.fromOccurredAt),
      toOccurredAt: toIsoString(request.toOccurredAt),
      nextCursor: hasMore && lastEvent ? replayCursor(lastEvent) : null,
    },
    events,
  };
}
