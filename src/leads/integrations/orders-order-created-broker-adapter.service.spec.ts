import {
  LEADS_ORDERS_EVENTS_CONSUMER_ENABLED,
  LEADS_ORDERS_EVENTS_RABBITMQ_URL,
  OrdersOrderCreatedBrokerAdapterConfig,
  OrdersOrderCreatedBrokerAdapterService,
  ordersOrderCreatedBrokerAdapterConfigFromEnv,
} from './orders-order-created-broker-adapter.service';

const baseConfig: OrdersOrderCreatedBrokerAdapterConfig = {
  enabled: true,
  rabbitmqUrl: 'amqp://synthetic-broker',
  exchange: 'orders.events',
  queue: 'leads.orders.order-created.v1',
  routingKey: 'orders.order.created.v1',
  prefetch: 2,
  deadLetterExchange: 'leads.orders.events.dlx',
  deadLetterQueue: 'leads.orders.order-created.v1.dlq',
  requeueOnError: false,
};

function buildAdapter(route = jest.fn().mockResolvedValue({ recorded: true })) {
  const channel = {
    assertExchange: jest.fn().mockResolvedValue(undefined),
    assertQueue: jest.fn().mockResolvedValue(undefined),
    bindQueue: jest.fn().mockResolvedValue(undefined),
    prefetch: jest.fn().mockResolvedValue(undefined),
    consume: jest.fn().mockResolvedValue(undefined),
    ack: jest.fn(),
    nack: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  };
  const connection = {
    createChannel: jest.fn().mockResolvedValue(channel),
    close: jest.fn().mockResolvedValue(undefined),
  };
  const connect = jest.fn().mockResolvedValue(connection);
  const loggingService = { log: jest.fn().mockResolvedValue(undefined) };
  const adapter = new OrdersOrderCreatedBrokerAdapterService({ route } as never, loggingService as never, connect);

  return { adapter, channel, connection, connect, loggingService, route };
}

describe('OrdersOrderCreatedBrokerAdapterService config', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('is disabled by default and uses conservative Leads-owned queue names', () => {
    delete process.env[LEADS_ORDERS_EVENTS_CONSUMER_ENABLED];
    delete process.env[LEADS_ORDERS_EVENTS_RABBITMQ_URL];

    expect(ordersOrderCreatedBrokerAdapterConfigFromEnv()).toEqual({
      enabled: false,
      rabbitmqUrl: undefined,
      exchange: 'orders.events',
      queue: 'leads.orders.order-created.v1',
      routingKey: 'orders.order.created.v1',
      prefetch: 5,
      deadLetterExchange: undefined,
      deadLetterQueue: undefined,
      requeueOnError: false,
    });
  });
});

describe('OrdersOrderCreatedBrokerAdapterService', () => {
  it('does not connect when the adapter is disabled', async () => {
    const originalEnv = { ...process.env };
    process.env = { ...originalEnv, [LEADS_ORDERS_EVENTS_CONSUMER_ENABLED]: 'false' };
    const { adapter, connect, loggingService } = buildAdapter();

    await adapter.onModuleInit();

    expect(connect).not.toHaveBeenCalled();
    expect(loggingService.log).toHaveBeenCalledWith(
      'info',
      'Orders created-event broker adapter disabled',
      expect.objectContaining({
        ordersEventsConsumer: expect.objectContaining({
          enabled: false,
          rabbitmqUrlConfigured: false,
        }),
      }),
    );
    process.env = originalEnv;
  });

  it('declares exchange, queue, dead-letter queue, binding, prefetch, and consumer', async () => {
    const { adapter, channel, connect } = buildAdapter();

    await adapter.start(baseConfig);

    expect(connect).toHaveBeenCalledWith('amqp://synthetic-broker');
    expect(channel.assertExchange).toHaveBeenCalledWith('orders.events', 'topic', { durable: true });
    expect(channel.assertExchange).toHaveBeenCalledWith('leads.orders.events.dlx', 'topic', { durable: true });
    expect(channel.assertQueue).toHaveBeenCalledWith('leads.orders.order-created.v1.dlq', { durable: true });
    expect(channel.bindQueue).toHaveBeenCalledWith(
      'leads.orders.order-created.v1.dlq',
      'leads.orders.events.dlx',
      'orders.order.created.v1',
    );
    expect(channel.assertQueue).toHaveBeenCalledWith('leads.orders.order-created.v1', {
      durable: true,
      arguments: { 'x-dead-letter-exchange': 'leads.orders.events.dlx' },
    });
    expect(channel.bindQueue).toHaveBeenCalledWith(
      'leads.orders.order-created.v1',
      'orders.events',
      'orders.order.created.v1',
    );
    expect(channel.prefetch).toHaveBeenCalledWith(2);
    expect(channel.consume).toHaveBeenCalledWith('leads.orders.order-created.v1', expect.any(Function), {
      noAck: false,
    });
  });

  it('acks attributed events after routing minimized lifecycle evidence', async () => {
    const { adapter, channel, route } = buildAdapter();
    await adapter.start(baseConfig);
    const message = {
      content: Buffer.from(
        JSON.stringify({
          type: 'orders.order.created.v1',
          eventVersion: 1,
          eventId: 'orders-event-synthetic-1',
          occurredAt: '2026-07-01T10:00:00.000Z',
          source: 'orders-microservice',
          payload: {
            orderId: 'order-1001',
            channel: 'flipflop',
            leadAttribution: {
              leadId: 'lead_synthetic_1',
              source: 'checkout-correlation',
              campaignId: 'campaign_synthetic_1',
            },
            customer: { email: 'synthetic.customer@example.test' },
            payment: { token: 'secret_payment_token' },
          },
        }),
      ),
    };

    await adapter.consumeMessage(message, baseConfig);

    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
    expect(route).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'LeadOrderAttributed',
        leadId: 'lead_synthetic_1',
        idempotencyKey: 'orders-order-created:order-1001',
      }),
    );
    const routedSerialized = JSON.stringify(route.mock.calls[0][0]);
    expect(routedSerialized).not.toContain('synthetic.customer@example.test');
    expect(routedSerialized).not.toContain('secret_payment_token');
  });

  it('acks skipped and malformed messages without routing raw payloads', async () => {
    const { adapter, channel, route, loggingService } = buildAdapter();
    await adapter.start(baseConfig);
    const consumer = channel.consume.mock.calls[0][1];
    const missingAttribution = {
      content: Buffer.from(
        JSON.stringify({
          type: 'orders.order.created.v1',
          eventVersion: 1,
          eventId: 'orders-event-synthetic-2',
          occurredAt: '2026-07-01T10:00:00.000Z',
          source: 'orders-microservice',
          payload: { orderId: 'order-1002', channel: 'flipflop' },
        }),
      ),
    };
    const malformed = { content: Buffer.from('not-json') };

    await adapter.consumeMessage(missingAttribution, baseConfig);
    await adapter.consumeMessage(malformed, baseConfig);

    expect(channel.ack).toHaveBeenCalledWith(missingAttribution);
    expect(channel.ack).toHaveBeenCalledWith(malformed);
    expect(route).not.toHaveBeenCalled();
    const serializedLogs = JSON.stringify(loggingService.log.mock.calls);
    expect(serializedLogs).not.toContain('not-json');
  });

  it('nacks handler failures to the configured DLQ path without requeue by default', async () => {
    const { adapter, channel } = buildAdapter(jest.fn().mockRejectedValue(new Error('synthetic route failure')));
    await adapter.start(baseConfig);
    const consumer = channel.consume.mock.calls[0][1];
    const message = {
      content: Buffer.from(
        JSON.stringify({
          type: 'orders.order.created.v1',
          eventVersion: 1,
          eventId: 'orders-event-synthetic-3',
          occurredAt: '2026-07-01T10:00:00.000Z',
          source: 'orders-microservice',
          payload: {
            orderId: 'order-1003',
            channel: 'flipflop',
            leadAttribution: { leadId: 'lead_synthetic_3' },
          },
        }),
      ),
    };

    await adapter.consumeMessage(message, baseConfig);

    expect(channel.ack).not.toHaveBeenCalledWith(message);
    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
  });
});
