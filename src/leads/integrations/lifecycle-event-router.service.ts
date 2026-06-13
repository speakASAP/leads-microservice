import { Injectable } from '@nestjs/common';
import { LoggingService } from '../../logging/logging.service';
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
  constructor(private readonly loggingService: LoggingService) {}

  async route<TEventType extends string, TPayload>(
    lifecycleEvent: LifecycleEventEnvelope<TEventType, TPayload>,
  ): Promise<LifecycleRoutingResult> {
    const consumerRoutes = consumerRoutesForLifecycleEvent(lifecycleEvent.eventType);
    const recordedAt = new Date().toISOString();

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
}
