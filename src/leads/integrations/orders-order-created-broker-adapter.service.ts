import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { LoggingService } from '../../logging/logging.service';
import { LeadLifecycleEventRouterService } from './lifecycle-event-router.service';
import {
  ORDERS_EVENTS_EXCHANGE,
  ORDERS_ORDER_CREATED_EVENT_TYPE,
  OrdersOrderCreatedRuntimeHandler,
  OrdersOrderCreatedRuntimeHandlerResult,
} from './orders-order-created-consumer-contract';

export const LEADS_ORDERS_EVENTS_CONSUMER_ENABLED = 'LEADS_ORDERS_EVENTS_CONSUMER_ENABLED';
export const LEADS_ORDERS_EVENTS_RABBITMQ_URL = 'LEADS_ORDERS_EVENTS_RABBITMQ_URL';
export const LEADS_ORDERS_EVENTS_QUEUE = 'LEADS_ORDERS_EVENTS_QUEUE';
export const LEADS_ORDERS_EVENTS_EXCHANGE = 'LEADS_ORDERS_EVENTS_EXCHANGE';
export const LEADS_ORDERS_EVENTS_ROUTING_KEY = 'LEADS_ORDERS_EVENTS_ROUTING_KEY';
export const LEADS_ORDERS_EVENTS_PREFETCH = 'LEADS_ORDERS_EVENTS_PREFETCH';
export const LEADS_ORDERS_EVENTS_DLX = 'LEADS_ORDERS_EVENTS_DLX';
export const LEADS_ORDERS_EVENTS_DLQ = 'LEADS_ORDERS_EVENTS_DLQ';
export const LEADS_ORDERS_EVENTS_REQUEUE_ON_ERROR = 'LEADS_ORDERS_EVENTS_REQUEUE_ON_ERROR';

export type OrdersOrderCreatedBrokerAdapterConfig = {
  enabled: boolean;
  rabbitmqUrl?: string;
  exchange: string;
  queue: string;
  routingKey: string;
  prefetch: number;
  deadLetterExchange?: string;
  deadLetterQueue?: string;
  requeueOnError: boolean;
};

type ConsumeMessageLike = Pick<ConsumeMessage, 'content'>;
type OrdersOrderCreatedBrokerConnection = Pick<ChannelModel, 'createChannel' | 'close'>;
type OrdersOrderCreatedBrokerChannel = Pick<
  Channel,
  | 'assertExchange'
  | 'assertQueue'
  | 'bindQueue'
  | 'prefetch'
  | 'consume'
  | 'ack'
  | 'nack'
  | 'close'
>;

export type OrdersOrderCreatedBrokerConnect = (url: string) => Promise<OrdersOrderCreatedBrokerConnection>;

function boolEnv(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function intEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function ordersOrderCreatedBrokerAdapterConfigFromEnv(): OrdersOrderCreatedBrokerAdapterConfig {
  return {
    enabled: boolEnv(LEADS_ORDERS_EVENTS_CONSUMER_ENABLED),
    rabbitmqUrl: optionalEnv(LEADS_ORDERS_EVENTS_RABBITMQ_URL),
    exchange: optionalEnv(LEADS_ORDERS_EVENTS_EXCHANGE) ?? ORDERS_EVENTS_EXCHANGE,
    queue: optionalEnv(LEADS_ORDERS_EVENTS_QUEUE) ?? 'leads.orders.order-created.v1',
    routingKey: optionalEnv(LEADS_ORDERS_EVENTS_ROUTING_KEY) ?? ORDERS_ORDER_CREATED_EVENT_TYPE,
    prefetch: intEnv(LEADS_ORDERS_EVENTS_PREFETCH, 5),
    deadLetterExchange: optionalEnv(LEADS_ORDERS_EVENTS_DLX),
    deadLetterQueue: optionalEnv(LEADS_ORDERS_EVENTS_DLQ),
    requeueOnError: boolEnv(LEADS_ORDERS_EVENTS_REQUEUE_ON_ERROR),
  };
}

@Injectable()
export class OrdersOrderCreatedBrokerAdapterService implements OnModuleInit, OnModuleDestroy {
  private readonly runtimeHandler: OrdersOrderCreatedRuntimeHandler;
  private readonly connectToBroker: OrdersOrderCreatedBrokerConnect = connect;
  private connection?: OrdersOrderCreatedBrokerConnection;
  private channel?: OrdersOrderCreatedBrokerChannel;

  constructor(
    private readonly lifecycleEventRouter: LeadLifecycleEventRouterService,
    private readonly loggingService: LoggingService,
  ) {
    this.runtimeHandler = new OrdersOrderCreatedRuntimeHandler(this.lifecycleEventRouter);
  }

  async onModuleInit() {
    const config = ordersOrderCreatedBrokerAdapterConfigFromEnv();
    if (!config.enabled) {
      await this.logAdapterState('Orders created-event broker adapter disabled', config);
      return;
    }

    if (!config.rabbitmqUrl) {
      await this.logAdapterState('Orders created-event broker adapter missing RabbitMQ URL', config);
      return;
    }

    await this.start(config);
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  async start(config: OrdersOrderCreatedBrokerAdapterConfig) {
    this.connection = await this.connectToBroker(config.rabbitmqUrl as string);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(config.exchange, 'topic', { durable: true });
    if (config.deadLetterExchange) {
      await this.channel.assertExchange(config.deadLetterExchange, 'topic', { durable: true });
    }
    if (config.deadLetterQueue && config.deadLetterExchange) {
      await this.channel.assertQueue(config.deadLetterQueue, { durable: true });
      await this.channel.bindQueue(config.deadLetterQueue, config.deadLetterExchange, config.routingKey);
    }

    const queueOptions = config.deadLetterExchange
      ? { durable: true, arguments: { 'x-dead-letter-exchange': config.deadLetterExchange } }
      : { durable: true };
    await this.channel.assertQueue(config.queue, queueOptions);
    await this.channel.bindQueue(config.queue, config.exchange, config.routingKey);
    await this.channel.prefetch(config.prefetch);
    await this.channel.consume(config.queue, (message) => void this.consumeMessage(message, config), { noAck: false });

    await this.logAdapterState('Orders created-event broker adapter started', config);
  }

  async consumeMessage(message: ConsumeMessageLike | null, config: OrdersOrderCreatedBrokerAdapterConfig) {
    if (!message || !this.channel) {
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(message.content.toString('utf8'));
    } catch {
      this.channel.ack(message as ConsumeMessage);
      await this.loggingService.log('warn', 'Orders created-event broker message rejected', {
        ordersEventsConsumer: {
          reason: 'invalid_json',
          exchange: config.exchange,
          queue: config.queue,
          routingKey: config.routingKey,
        },
      });
      return;
    }

    try {
      const result = await this.runtimeHandler.handle(payload);
      this.channel.ack(message as ConsumeMessage);
      await this.logProcessingResult(result, config);
    } catch (error) {
      this.channel.nack(message as ConsumeMessage, false, config.requeueOnError);
      await this.loggingService.log('error', 'Orders created-event broker message failed', {
        ordersEventsConsumer: {
          reason: 'handler_error',
          exchange: config.exchange,
          queue: config.queue,
          routingKey: config.routingKey,
          requeued: config.requeueOnError,
          errorName: error instanceof Error ? error.name : 'unknown',
        },
      });
    }
  }

  private async logProcessingResult(
    result: OrdersOrderCreatedRuntimeHandlerResult,
    config: OrdersOrderCreatedBrokerAdapterConfig,
  ) {
    await this.loggingService.log('info', 'Orders created-event broker message processed', {
      ordersEventsConsumer: {
        status: result.status,
        exchange: config.exchange,
        queue: config.queue,
        routingKey: config.routingKey,
        orderIdPresent: Boolean(result.orderReference?.orderId),
        leadAttributionAccepted: result.status === 'accepted',
        duplicateIgnored: result.status === 'duplicate_ignored',
        metrics: this.runtimeHandler.metrics,
      },
    });
  }

  private async logAdapterState(message: string, config: OrdersOrderCreatedBrokerAdapterConfig) {
    await this.loggingService.log('info', message, {
      ordersEventsConsumer: {
        enabled: config.enabled,
        exchange: config.exchange,
        queue: config.queue,
        routingKey: config.routingKey,
        prefetch: config.prefetch,
        deadLetterExchangeConfigured: Boolean(config.deadLetterExchange),
        deadLetterQueueConfigured: Boolean(config.deadLetterQueue),
        rabbitmqUrlConfigured: Boolean(config.rabbitmqUrl),
      },
    });
  }
}
