import { LifecycleEventEnvelope } from './lifecycle-events';

export const ORDERS_EVENTS_EXCHANGE = 'orders.events';
export const ORDERS_ORDER_CREATED_EVENT_TYPE = 'orders.order.created.v1';
export const ORDERS_ORDER_CREATED_EVENT_VERSION = 1;
export const ORDERS_EVENT_SOURCE = 'orders-microservice';

export const MISSING_ORDER_CREATED_LEAD_ATTRIBUTION =
  '[MISSING: Orders order-created event lead attribution field]';
export const MISSING_LEADS_RABBITMQ_RUNTIME_CONVENTION =
  '[MISSING: Leads RabbitMQ consumer runtime convention for orders.events queue name, env vars, retry/backoff, and DLQ handling]';
export const MISSING_ORDERS_REPLAY_BACKFILL_SOURCE =
  '[MISSING: replay/backfill validation source for missed Orders events]';

export const ORDERS_ORDER_CREATED_CONSUMER_BLOCKERS = [
  MISSING_ORDER_CREATED_LEAD_ATTRIBUTION,
  MISSING_LEADS_RABBITMQ_RUNTIME_CONVENTION,
  MISSING_ORDERS_REPLAY_BACKFILL_SOURCE,
] as const;

export type OrdersOrderCreatedPayload = {
  orderId: string;
  channel: string;
  leadAttribution?: {
    leadId?: string;
    source?: string;
    method?: string;
  };
};

export type OrdersOrderCreatedEnvelope = {
  type: typeof ORDERS_ORDER_CREATED_EVENT_TYPE;
  eventVersion: typeof ORDERS_ORDER_CREATED_EVENT_VERSION;
  eventId: string;
  occurredAt: string;
  source: typeof ORDERS_EVENT_SOURCE;
  payload: OrdersOrderCreatedPayload;
};

export type LeadOrderAttributedPayload = {
  leadId: string;
  orderId: string;
  orderChannel: string;
  orderEventId: string;
  orderEventOccurredAt: string;
  orderSourceOfTruth: typeof ORDERS_EVENT_SOURCE;
  attributionSource: string;
  attributionMethod: string;
};

export type OrderCreatedReference = {
  orderId: string;
  channel: string;
  orderEventId: string;
  orderEventOccurredAt: string;
};

export type OrderCreatedAttributionReady = {
  status: 'ready';
  orderReference: OrderCreatedReference;
  lifecycleEvent: LifecycleEventEnvelope<'LeadOrderAttributed', LeadOrderAttributedPayload>;
};

export type OrderCreatedAttributionBlocked = {
  status: 'blocked';
  blockers: string[];
  orderReference?: OrderCreatedReference;
};

export type OrderCreatedAttributionResult =
  | OrderCreatedAttributionReady
  | OrderCreatedAttributionBlocked;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function validIsoDate(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : value;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function readOrderReference(event: UnknownRecord): OrderCreatedReference | undefined {
  const payload = isRecord(event.payload) ? event.payload : null;
  const orderId = payload ? nonEmptyString(payload.orderId) : null;
  const channel = payload ? nonEmptyString(payload.channel) : null;
  const orderEventId = nonEmptyString(event.eventId);
  const orderEventOccurredAt = validIsoDate(nonEmptyString(event.occurredAt));

  if (!orderId || !channel || !orderEventId || !orderEventOccurredAt) {
    return undefined;
  }

  return {
    orderId,
    channel,
    orderEventId,
    orderEventOccurredAt,
  };
}

function envelopeBlockers(event: unknown): string[] {
  if (!isRecord(event)) {
    return [`[MISSING: valid ${ORDERS_ORDER_CREATED_EVENT_TYPE} envelope object]`];
  }

  const blockers: string[] = [];
  if (event.type !== ORDERS_ORDER_CREATED_EVENT_TYPE) {
    blockers.push(`[MISSING: valid ${ORDERS_ORDER_CREATED_EVENT_TYPE} envelope type]`);
  }
  if (event.eventVersion !== ORDERS_ORDER_CREATED_EVENT_VERSION) {
    blockers.push('[MISSING: valid Orders event version 1]');
  }
  if (event.source !== ORDERS_EVENT_SOURCE) {
    blockers.push('[MISSING: valid Orders event source orders-microservice]');
  }
  if (!nonEmptyString(event.eventId)) {
    blockers.push('[MISSING: valid Orders eventId]');
  }
  if (!validIsoDate(nonEmptyString(event.occurredAt))) {
    blockers.push('[MISSING: valid Orders event occurredAt]');
  }
  if (!isRecord(event.payload)) {
    blockers.push('[MISSING: valid Orders event payload object]');
    return unique(blockers);
  }
  if (!nonEmptyString(event.payload.orderId)) {
    blockers.push('[MISSING: valid Orders payload.orderId]');
  }
  if (!nonEmptyString(event.payload.channel)) {
    blockers.push('[MISSING: valid Orders payload.channel]');
  }

  return unique(blockers);
}

function readLeadAttribution(payload: UnknownRecord): { leadId: string; source: string; method: string } | null {
  const attribution = isRecord(payload.leadAttribution) ? payload.leadAttribution : null;
  const leadId = attribution ? nonEmptyString(attribution.leadId) : null;
  if (!leadId) {
    return null;
  }

  return {
    leadId,
    source: nonEmptyString(attribution?.source) ?? ORDERS_ORDER_CREATED_EVENT_TYPE,
    method: nonEmptyString(attribution?.method) ?? 'orders-event-lead-attribution',
  };
}

export function buildLeadOrderAttributedEventFromOrderCreated(
  event: unknown,
): OrderCreatedAttributionResult {
  const blockers = envelopeBlockers(event);
  const orderReference = isRecord(event) ? readOrderReference(event) : undefined;
  if (blockers.length > 0) {
    return { status: 'blocked', blockers, ...(orderReference ? { orderReference } : {}) };
  }

  const canonicalEvent = event as OrdersOrderCreatedEnvelope;
  const attribution = readLeadAttribution(canonicalEvent.payload);
  if (!attribution) {
    return {
      status: 'blocked',
      blockers: [MISSING_ORDER_CREATED_LEAD_ATTRIBUTION],
      orderReference,
    };
  }

  const payload: LeadOrderAttributedPayload = {
    leadId: attribution.leadId,
    orderId: canonicalEvent.payload.orderId,
    orderChannel: canonicalEvent.payload.channel,
    orderEventId: canonicalEvent.eventId,
    orderEventOccurredAt: canonicalEvent.occurredAt,
    orderSourceOfTruth: ORDERS_EVENT_SOURCE,
    attributionSource: attribution.source,
    attributionMethod: attribution.method,
  };

  return {
    status: 'ready',
    orderReference: orderReference as OrderCreatedReference,
    lifecycleEvent: {
      eventId: `lead-order-attributed:${canonicalEvent.eventId}`,
      eventType: 'LeadOrderAttributed',
      eventVersion: 1,
      occurredAt: canonicalEvent.occurredAt,
      producer: 'leads-microservice',
      leadId: attribution.leadId,
      correlationId: canonicalEvent.payload.orderId,
      idempotencyKey: `orders-order-created:${canonicalEvent.payload.orderId}`,
      dataClass: 'minimized',
      payload,
    },
  };
}
