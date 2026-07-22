import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { LoggingService } from '../../logging/logging.service';
import { RegistrationLeadService } from './registration-lead.service';
import { USER_REGISTERED } from './registration-lead';

export const LEADS_AUTH_EVENTS_CONSUMER_ENABLED = 'LEADS_AUTH_EVENTS_CONSUMER_ENABLED';
export const LEADS_AUTH_EVENTS_RABBITMQ_URL = 'LEADS_AUTH_EVENTS_RABBITMQ_URL';
export const LEADS_AUTH_EVENTS_QUEUE = 'LEADS_AUTH_EVENTS_QUEUE';
export const LEADS_AUTH_EVENTS_EXCHANGE = 'LEADS_AUTH_EVENTS_EXCHANGE';

export const AUTH_EVENTS_EXCHANGE = 'auth.events';

/**
 * **This service's own queue, not growth-core's.**
 *
 * `auth.events` is a topic exchange, and two consumers bound to the *same* queue share the
 * messages between them — each would see roughly half the registrations, and both sets of numbers
 * would look plausible and be wrong. A separate queue per consumer means each sees every event.
 */
export const DEFAULT_QUEUE = 'leads.auth.user-registered.v1';

export type AuthRegisteredBrokerConfig = {
  enabled: boolean;
  rabbitmqUrl?: string;
  exchange: string;
  queue: string;
  routingKey: string;
  prefetch: number;
};

type ConsumeMessageLike = Pick<ConsumeMessage, 'content'>;
type BrokerConnection = Pick<ChannelModel, 'createChannel' | 'close'>;
type BrokerChannel = Pick<
  Channel,
  'assertExchange' | 'assertQueue' | 'bindQueue' | 'prefetch' | 'consume' | 'ack' | 'nack' | 'close'
>;

export type AuthRegisteredBrokerConnect = (url: string) => Promise<BrokerConnection>;

function boolEnv(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function authRegisteredBrokerConfigFromEnv(): AuthRegisteredBrokerConfig {
  return {
    enabled: boolEnv(LEADS_AUTH_EVENTS_CONSUMER_ENABLED),
    rabbitmqUrl: optionalEnv(LEADS_AUTH_EVENTS_RABBITMQ_URL) ?? optionalEnv('RABBITMQ_URL'),
    exchange: optionalEnv(LEADS_AUTH_EVENTS_EXCHANGE) ?? AUTH_EVENTS_EXCHANGE,
    queue: optionalEnv(LEADS_AUTH_EVENTS_QUEUE) ?? DEFAULT_QUEUE,
    routingKey: USER_REGISTERED,
    prefetch: 5,
  };
}

/**
 * Consumes `auth.user.registered.v1` and turns each registration into a lead (EP-005 W5).
 *
 * The queue is declared and bound here rather than by hand: a topic exchange discards a message
 * with no matching binding, so a queue that exists but is unbound looks entirely healthy and
 * receives nothing at all.
 */
@Injectable()
export class AuthRegisteredBrokerAdapterService implements OnModuleInit, OnModuleDestroy {
  private readonly connectToBroker: AuthRegisteredBrokerConnect = connect;
  private connection?: BrokerConnection;
  private channel?: BrokerChannel;

  constructor(
    private readonly registrationLeads: RegistrationLeadService,
    private readonly logging: LoggingService,
  ) {}

  async onModuleInit() {
    const config = authRegisteredBrokerConfigFromEnv();
    if (!config.enabled || !config.rabbitmqUrl) {
      await this.logging.log('info', 'Auth registration consumer not started', {
        authEventsConsumer: { enabled: config.enabled, urlConfigured: Boolean(config.rabbitmqUrl) },
      });
      return;
    }

    try {
      await this.start(config);
    } catch (error) {
      // A broker that is down at boot must not crash-loop the pod: lead intake over HTTP keeps
      // working without it, and the queue is durable, so the registrations wait rather than
      // disappear.
      await this.logging.log('error', 'Auth registration consumer failed to start', {
        authEventsConsumer: { errorMessage: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  async onModuleDestroy() {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  async start(config: AuthRegisteredBrokerConfig) {
    this.connection = await this.connectToBroker(config.rabbitmqUrl as string);
    this.channel = await this.connection.createChannel();

    // Asserted, because this consumer may well boot before auth has ever published and binding to
    // an exchange that does not exist yet fails.
    await this.channel.assertExchange(config.exchange, 'topic', { durable: true });
    await this.channel.assertQueue(config.queue, { durable: true });
    await this.channel.bindQueue(config.queue, config.exchange, config.routingKey);
    await this.channel.prefetch(config.prefetch);
    await this.channel.consume(config.queue, (message) => void this.consumeMessage(message, config), {
      noAck: false,
    });

    await this.logging.log('info', 'Auth registration consumer started', {
      authEventsConsumer: { exchange: config.exchange, queue: config.queue, routingKey: config.routingKey },
    });
  }

  async consumeMessage(message: ConsumeMessageLike | null, config: AuthRegisteredBrokerConfig) {
    // A null delivery is how the broker reports a cancelled consumer, not a message.
    if (!message || !this.channel) return;

    let event: unknown;
    try {
      event = JSON.parse(message.content.toString('utf8'));
    } catch {
      // Unparseable now is unparseable forever. Requeueing would spin the consumer and block
      // every valid registration behind it.
      this.channel.ack(message as ConsumeMessage);
      await this.logging.log('warn', 'Auth registration message rejected', {
        authEventsConsumer: { reason: 'invalid_json', queue: config.queue },
      });
      return;
    }

    try {
      const result = await this.registrationLeads.handle(event);
      this.channel.ack(message as ConsumeMessage);
      await this.logging.log('info', 'Auth registration message processed', {
        authEventsConsumer: { status: result.status, queue: config.queue },
      });
    } catch (error) {
      // Requeue: a database failure is transient and the registration is still needed. Creating
      // the lead is idempotent on authUserId, so redelivery is safe.
      this.channel.nack(message as ConsumeMessage, false, true);
      await this.logging.log('error', 'Auth registration message failed', {
        authEventsConsumer: {
          reason: 'handler_error',
          queue: config.queue,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}
