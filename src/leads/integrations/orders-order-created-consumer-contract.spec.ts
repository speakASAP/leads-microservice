import {
  buildLeadOrderAttributedEventFromOrderCreated,
  MISSING_ORDER_CREATED_LEAD_ATTRIBUTION,
  ORDERS_ORDER_CREATED_EVENT_TYPE,
} from './orders-order-created-consumer-contract';

const canonicalCurrentOrderCreatedEvent = {
  type: 'orders.order.created.v1',
  eventVersion: 1,
  eventId: '00000000-0000-4000-8000-000000000001',
  occurredAt: '2026-06-13T08:00:00.000Z',
  source: 'orders-microservice',
  payload: {
    orderId: 'order-1001',
    channel: 'flipflop',
  },
};

describe('Orders order-created Leads attribution contract', () => {
  it('recognizes the current canonical Orders event but blocks attribution without a lead key', () => {
    const result = buildLeadOrderAttributedEventFromOrderCreated(canonicalCurrentOrderCreatedEvent);

    expect(result.status).toBe('blocked');
    if (result.status !== 'blocked') {
      throw new Error('Expected blocked attribution result');
    }

    expect(result.orderReference).toEqual({
      orderId: 'order-1001',
      channel: 'flipflop',
      orderEventId: '00000000-0000-4000-8000-000000000001',
      orderEventOccurredAt: '2026-06-13T08:00:00.000Z',
    });
    expect(result.blockers).toContain(MISSING_ORDER_CREATED_LEAD_ATTRIBUTION);
  });

  it('builds a minimized LeadOrderAttributed lifecycle event only when explicit lead attribution exists', () => {
    const result = buildLeadOrderAttributedEventFromOrderCreated({
      ...canonicalCurrentOrderCreatedEvent,
      eventId: 'orders-event-synthetic-attributed',
      payload: {
        ...canonicalCurrentOrderCreatedEvent.payload,
        leadAttribution: {
          leadId: 'lead_synthetic_1',
          source: 'checkout-correlation',
          method: 'owner-approved-order-lead-link',
        },
        customer: {
          email: 'synthetic.customer@example.test',
          name: 'Synthetic Customer',
        },
        shippingAddress: {
          street: '123 Private Test Street',
          postalCode: '12345',
        },
        payment: {
          cardNumber: '4242424242424242',
          providerSecret: 'secret_test_payment_provider',
        },
        token: 'jwt.synthetic.token',
        metadata: {
          rawMessage: 'private lead message',
          confirmationToken: 'confirmation-token-synthetic',
        },
      },
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      throw new Error('Expected ready attribution result');
    }

    expect(result.lifecycleEvent).toEqual({
      eventId: 'lead-order-attributed:orders-event-synthetic-attributed',
      eventType: 'LeadOrderAttributed',
      eventVersion: 1,
      occurredAt: '2026-06-13T08:00:00.000Z',
      producer: 'leads-microservice',
      leadId: 'lead_synthetic_1',
      correlationId: 'order-1001',
      idempotencyKey: 'orders-order-created:order-1001',
      dataClass: 'minimized',
      payload: {
        leadId: 'lead_synthetic_1',
        orderId: 'order-1001',
        orderChannel: 'flipflop',
        orderEventId: 'orders-event-synthetic-attributed',
        orderEventOccurredAt: '2026-06-13T08:00:00.000Z',
        orderSourceOfTruth: 'orders-microservice',
        attributionSource: 'checkout-correlation',
        attributionMethod: 'owner-approved-order-lead-link',
      },
    });

    const serialized = JSON.stringify(result.lifecycleEvent);
    expect(serialized).not.toContain('synthetic.customer@example.test');
    expect(serialized).not.toContain('Synthetic Customer');
    expect(serialized).not.toContain('123 Private Test Street');
    expect(serialized).not.toContain('12345');
    expect(serialized).not.toContain('4242424242424242');
    expect(serialized).not.toContain('secret_test_payment_provider');
    expect(serialized).not.toContain('jwt.synthetic.token');
    expect(serialized).not.toContain('private lead message');
    expect(serialized).not.toContain('confirmation-token-synthetic');
  });

  it('rejects non-canonical Orders event envelopes', () => {
    const result = buildLeadOrderAttributedEventFromOrderCreated({
      ...canonicalCurrentOrderCreatedEvent,
      type: 'orders.order.updated.v1',
      eventVersion: 2,
      source: 'marketplace-service',
    });

    expect(result.status).toBe('blocked');
    if (result.status !== 'blocked') {
      throw new Error('Expected blocked attribution result');
    }

    expect(result.blockers).toEqual([
      `[MISSING: valid ${ORDERS_ORDER_CREATED_EVENT_TYPE} envelope type]`,
      '[MISSING: valid Orders event version 1]',
      '[MISSING: valid Orders event source orders-microservice]',
    ]);
  });

  it('keeps the idempotency key stable for redelivery of the same canonical order', () => {
    const first = buildLeadOrderAttributedEventFromOrderCreated({
      ...canonicalCurrentOrderCreatedEvent,
      eventId: 'orders-event-redelivery-1',
      payload: { ...canonicalCurrentOrderCreatedEvent.payload, leadAttribution: { leadId: 'lead_synthetic_1' } },
    });
    const second = buildLeadOrderAttributedEventFromOrderCreated({
      ...canonicalCurrentOrderCreatedEvent,
      eventId: 'orders-event-redelivery-2',
      payload: { ...canonicalCurrentOrderCreatedEvent.payload, leadAttribution: { leadId: 'lead_synthetic_1' } },
    });

    expect(first.status).toBe('ready');
    expect(second.status).toBe('ready');
    if (first.status !== 'ready' || second.status !== 'ready') {
      throw new Error('Expected ready attribution results');
    }
    expect(first.lifecycleEvent.idempotencyKey).toBe('orders-order-created:order-1001');
    expect(second.lifecycleEvent.idempotencyKey).toBe(first.lifecycleEvent.idempotencyKey);
  });
});
