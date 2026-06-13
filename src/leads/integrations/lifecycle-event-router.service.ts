import { Injectable, Optional } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoggingService } from '../../logging/logging.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LifecycleEventEnvelope } from './lifecycle-events';

export type LeadLifecycleConsumer =
  | 'auth'
  | 'crm'
  | 'marketing'
  | 'logging-analytics'
  | 'product-apps';

export type LifecycleRoutingResult = {
  eventId: string;
  eventType: string;
  leadId: string;
  consumerRoutes: LeadLifecycleConsumer[];
  recordedAt: string;
};

const ROUTES_BY_EVENT_TYPE: Record<string, LeadLifecycleConsumer[]> = {
  LeadSubmitted: ['crm', 'marketing', 'logging-analytics', 'product-apps'],
  LeadConfirmed: ['auth', 'crm', 'marketing', 'logging-analytics'],
  LeadPreferenceUpdated: ['crm', 'marketing', 'logging-analytics'],
  LeadConvertedToUser: ['auth', 'crm', 'marketing', 'logging-analytics'],
};

export function consumerRoutesForLifecycleEvent(eventType: string): LeadLifecycleConsumer[] {
  return ROUTES_BY_EVENT_TYPE[eventType] ?? ['logging-analytics'];
}

@Injectable()
export class LeadLifecycleEventRouterService {
  constructor(
    private readonly loggingService: LoggingService,
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async route<TEventType extends string, TPayload>(
    lifecycleEvent: LifecycleEventEnvelope<TEventType, TPayload>,
  ): Promise<LifecycleRoutingResult> {
    const consumerRoutes = consumerRoutesForLifecycleEvent(lifecycleEvent.eventType);
    const recordedAt = new Date().toISOString();

    await this.persist(lifecycleEvent, consumerRoutes);

    await this.loggingService.log('info', 'Lead lifecycle event routed', {
      lifecycleEvent,
      lifecycleRouting: {
        eventId: lifecycleEvent.eventId,
        eventType: lifecycleEvent.eventType,
        leadId: lifecycleEvent.leadId,
        consumerRoutes,
        consumerRouteCount: consumerRoutes.length,
        recordedAt,
      },
    });

    return {
      eventId: lifecycleEvent.eventId,
      eventType: lifecycleEvent.eventType,
      leadId: lifecycleEvent.leadId,
      consumerRoutes,
      recordedAt,
    };
  }

  private async persist<TEventType extends string, TPayload>(
    lifecycleEvent: LifecycleEventEnvelope<TEventType, TPayload>,
    consumerRoutes: LeadLifecycleConsumer[],
  ) {
    if (!this.prisma) {
      return;
    }

    const data = {
      leadId: lifecycleEvent.leadId,
      eventId: lifecycleEvent.eventId,
      eventType: lifecycleEvent.eventType,
      eventVersion: lifecycleEvent.eventVersion,
      occurredAt: new Date(lifecycleEvent.occurredAt),
      producer: lifecycleEvent.producer,
      correlationId: lifecycleEvent.correlationId ?? null,
      idempotencyKey: lifecycleEvent.idempotencyKey ?? null,
      dataClass: lifecycleEvent.dataClass,
      payload: lifecycleEvent.payload as Prisma.InputJsonValue,
      consumerRoutes: consumerRoutes as Prisma.InputJsonValue,
    };

    if (lifecycleEvent.idempotencyKey) {
      const { eventId: _eventId, idempotencyKey: _idempotencyKey, leadId: _leadId, ...updateData } = data;
      await this.prisma.leadLifecycleEvent.upsert({
        where: { idempotencyKey: lifecycleEvent.idempotencyKey },
        create: data,
        update: updateData,
      });
      return;
    }

    await this.prisma.leadLifecycleEvent.upsert({
      where: { eventId: lifecycleEvent.eventId },
      create: data,
      update: data,
    });
  }
}
