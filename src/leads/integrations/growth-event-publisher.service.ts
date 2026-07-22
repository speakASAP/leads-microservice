import { Injectable, OnModuleDestroy, Optional } from '@nestjs/common';
import { connect, ChannelModel, ConfirmChannel } from 'amqplib';
import { LoggingService } from '../../logging/logging.service';

type BrokerConnection = Pick<ChannelModel, 'createConfirmChannel' | 'close'>;
type BrokerChannel = Pick<ConfirmChannel, 'assertExchange' | 'publish' | 'waitForConfirms' | 'close'>;

export type GrowthEventBrokerConnect = (url: string) => Promise<BrokerConnection>;

/**
 * Publishes `growth.lead.created_from_registration.v1` onto `leads.events` (EP-005 W5).
 *
 * A **confirm channel**, awaited: the caller treats a resolved publish as "announced" and moves
 * on, so that has to mean the broker durably holds the message. A plain channel returns as soon
 * as the bytes reach the socket, which would let a broker crash lose the announcement while
 * everything reported success.
 */
@Injectable()
export class GrowthEventPublisherService implements OnModuleDestroy {
  private connection?: BrokerConnection;
  private channel?: BrokerChannel;

  constructor(
    private readonly logging: LoggingService,
    @Optional() private readonly connectToBroker: GrowthEventBrokerConnect = connect,
  ) {}

  async onModuleDestroy() {
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  async publish(exchange: string, routingKey: string, envelope: unknown): Promise<void> {
    const url = process.env.LEADS_GROWTH_EVENTS_RABBITMQ_URL?.trim() || process.env.RABBITMQ_URL?.trim();
    if (!url) {
      // Refusing loudly beats publishing to nowhere: the caller logs it with the envelope, so the
      // announcement can be replayed once a URL exists.
      throw new Error('[MISSING: RABBITMQ_URL] — cannot publish growth lead events');
    }

    const channel = await this.channelReady(url, exchange);
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(envelope)), {
      persistent: true,
      contentType: 'application/json',
      type: routingKey,
      timestamp: Date.now(),
    });
    await channel.waitForConfirms();
  }

  private async channelReady(url: string, exchange: string): Promise<BrokerChannel> {
    if (this.channel) return this.channel;

    this.connection = await this.connectToBroker(url);
    const channel = await this.connection.createConfirmChannel();
    await channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel = channel;

    await this.logging.log('info', 'Growth lead event publisher connected', {
      growthEventPublisher: { exchange },
    });
    return channel;
  }
}
