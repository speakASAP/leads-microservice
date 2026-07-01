import {
  buildLeadOrderAttributedEventFromOrderCreated,
  OrdersOrderCreatedRuntimeHandler,
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

function attributedEvent(overrides: Record<string, unknown> = {}) {
  return {
    ...canonicalCurrentOrderCreatedEvent,
    ...overrides,
    payload: {
      ...canonicalCurrentOrderCreatedEvent.payload,
      leadAttribution: {
        leadId: 'lead_synthetic_1',
        source: 'checkout-correlation',
        campaignId: 'campaign_synthetic_1',
      },
      ...(overrides.payload as Record<string, unknown> | undefined),
    },
  };
}

function buildHandler() {
  const router = { route: jest.fn().mockResolvedValue({ recorded: true }) };
  const handler = new OrdersOrderCreatedRuntimeHandler(router);
  return { handler, router };
}

describe('Orders order-created Leads attribution contract', () => {
  it('builds a minimized LeadOrderAttributed lifecycle event only when explicit lead attribution exists', () => {
    const result = buildLeadOrderAttributedEventFromOrderCreated(
      attributedEvent({
        eventId: 'orders-event-synthetic-attributed',
        payload: {
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
      }),
    );

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
        attributionCampaignId: 'campaign_synthetic_1',
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

  it('idempotently skips Orders events without explicit leadAttribution.leadId', async () => {
    const { handler, router } = buildHandler();

    const result = await handler.handle(canonicalCurrentOrderCreatedEvent);

    expect(result).toEqual({
      status: 'skipped_missing_attribution',
      orderReference: {
        orderId: 'order-1001',
        channel: 'flipflop',
        orderEventId: '00000000-0000-4000-8000-000000000001',
        orderEventOccurredAt: '2026-06-13T08:00:00.000Z',
      },
      blockers: ['[MISSING: explicit Orders payload.leadAttribution.leadId]'],
    });
    expect(router.route).not.toHaveBeenCalled();
    expect(handler.metrics).toEqual({
      accepted: 0,
      skippedMissingAttribution: 1,
      duplicateIgnored: 0,
      rejectedMalformed: 0,
    });
  });

  it('accepts explicit lead attribution once and ignores duplicate event/order deliveries', async () => {
    const { handler, router } = buildHandler();

    const accepted = await handler.handle(attributedEvent({ eventId: 'orders-event-redelivery-1' }));
    const duplicateEventId = await handler.handle(attributedEvent({ eventId: 'orders-event-redelivery-1' }));
    const duplicateOrderId = await handler.handle(attributedEvent({ eventId: 'orders-event-redelivery-2' }));

    expect(accepted.status).toBe('accepted');
    expect(duplicateEventId.status).toBe('duplicate_ignored');
    expect(duplicateOrderId.status).toBe('duplicate_ignored');
    expect(router.route).toHaveBeenCalledTimes(1);
    expect(handler.metrics).toEqual({
      accepted: 1,
      skippedMissingAttribution: 0,
      duplicateIgnored: 2,
      rejectedMalformed: 0,
    });
  });

  it('rejects malformed or non-canonical Orders event envelopes without routing', async () => {
    const { handler, router } = buildHandler();

    const result = await handler.handle({
      ...canonicalCurrentOrderCreatedEvent,
      type: 'orders.order.updated.v1',
      eventVersion: 2,
      source: 'marketplace-service',
    });

    expect(result.status).toBe('rejected_malformed');
    expect(result.blockers).toEqual([
      `[MISSING: valid ${ORDERS_ORDER_CREATED_EVENT_TYPE} envelope type]`,
      '[MISSING: valid Orders event version 1]',
      '[MISSING: valid Orders event source orders-microservice]',
    ]);
    expect(router.route).not.toHaveBeenCalled();
  });

  it('routes only Leads-owned minimized attribution evidence and does not duplicate Orders state', async () => {
    const { handler, router } = buildHandler();

    await handler.handle(
      attributedEvent({
        payload: {
          orderStatus: 'paid',
          orderTotal: 12345,
          orderLines: [{ sku: 'private-sku', quantity: 2 }],
          customer: { email: 'synthetic.customer@example.test' },
        },
      }),
    );

    const routedEvent = router.route.mock.calls[0]?.[0];
    expect(routedEvent.eventType).toBe('LeadOrderAttributed');
    expect(routedEvent.payload).toEqual({
      leadId: 'lead_synthetic_1',
      orderId: 'order-1001',
      orderChannel: 'flipflop',
      orderEventId: '00000000-0000-4000-8000-000000000001',
      orderEventOccurredAt: '2026-06-13T08:00:00.000Z',
      orderSourceOfTruth: 'orders-microservice',
      attributionSource: 'checkout-correlation',
      attributionCampaignId: 'campaign_synthetic_1',
    });

    const serialized = JSON.stringify(routedEvent);
    expect(serialized).not.toContain('paid');
    expect(serialized).not.toContain('12345');
    expect(serialized).not.toContain('private-sku');
    expect(serialized).not.toContain('synthetic.customer@example.test');
  });
});
