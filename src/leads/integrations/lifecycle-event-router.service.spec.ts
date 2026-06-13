import { LeadLifecycleEventRouterService, consumerRoutesForLifecycleEvent } from './lifecycle-event-router.service';

describe('LeadLifecycleEventRouterService', () => {
  it('maps lifecycle events to intended minimized consumer routes', () => {
    expect(consumerRoutesForLifecycleEvent('LeadSubmitted')).toEqual([
      'crm',
      'marketing',
      'logging-analytics',
      'product-apps',
    ]);
    expect(consumerRoutesForLifecycleEvent('LeadConvertedToUser')).toEqual([
      'auth',
      'crm',
      'marketing',
      'logging-analytics',
    ]);
    expect(consumerRoutesForLifecycleEvent('UnknownEvent')).toEqual(['logging-analytics']);
  });

  it('records routed lifecycle events without adding raw lead data', async () => {
    const loggingService = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    const router = new LeadLifecycleEventRouterService(loggingService as never);

    const result = await router.route({
      eventId: 'evt_synthetic_1',
      eventType: 'LeadConvertedToUser',
      eventVersion: 1,
      occurredAt: '2026-06-13T03:00:00.000Z',
      producer: 'leads-microservice',
      leadId: 'lead_synthetic_1',
      correlationId: 'lead_synthetic_1',
      idempotencyKey: 'lead-converted-to-user:lead_synthetic_1:auth_user_synthetic_1:verified_contact:1781319600000',
      dataClass: 'minimized',
      payload: {
        leadId: 'lead_synthetic_1',
        userId: 'auth_user_synthetic_1',
        sourceService: 'shop-assistant',
        linkMethod: 'verified_contact',
        linkedAt: '2026-06-13T03:00:00.000Z',
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        eventId: 'evt_synthetic_1',
        eventType: 'LeadConvertedToUser',
        leadId: 'lead_synthetic_1',
        consumerRoutes: ['auth', 'crm', 'marketing', 'logging-analytics'],
      }),
    );
    expect(loggingService.log).toHaveBeenCalledWith(
      'info',
      'Lead lifecycle event routed',
      expect.objectContaining({
        lifecycleRouting: expect.objectContaining({
          eventId: 'evt_synthetic_1',
          eventType: 'LeadConvertedToUser',
          leadId: 'lead_synthetic_1',
          consumerRouteCount: 4,
        }),
      }),
    );

    const serialized = JSON.stringify(loggingService.log.mock.calls[0]?.[2]);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('private/path');
    expect(serialized).not.toContain('raw message');
  });
});


describe('LeadLifecycleEventRouterService durable storage', () => {
  it('persists lifecycle events idempotently before route logging', async () => {
    const loggingService = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    const prisma = {
      leadLifecycleEvent: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    };
    const router = new LeadLifecycleEventRouterService(loggingService as never, prisma as never);

    await router.route({
      eventId: 'evt_synthetic_2',
      eventType: 'LeadSubmitted',
      eventVersion: 1,
      occurredAt: '2026-06-13T00:00:00.000Z',
      producer: 'leads-microservice',
      leadId: 'lead_synthetic_2',
      correlationId: 'lead_synthetic_2',
      idempotencyKey: 'lead-submitted:lead_synthetic_2',
      dataClass: 'minimized',
      payload: {
        leadId: 'lead_synthetic_2',
        sourceService: 'shop-assistant',
        sourceHost: 'shop.example',
        contactMethodTypes: ['email'],
        contactMethodCount: 1,
        consentEvidencePresent: true,
      },
    });

    expect(prisma.leadLifecycleEvent.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'lead-submitted:lead_synthetic_2' },
        create: expect.objectContaining({
          eventId: 'evt_synthetic_2',
          eventType: 'LeadSubmitted',
          leadId: 'lead_synthetic_2',
          dataClass: 'minimized',
          consumerRoutes: ['crm', 'marketing', 'logging-analytics', 'product-apps'],
          payload: expect.objectContaining({
            sourceHost: 'shop.example',
            contactMethodCount: 1,
          }),
        }),
        update: expect.objectContaining({
          eventType: 'LeadSubmitted',
        }),
      }),
    );

    expect(prisma.leadLifecycleEvent.upsert.mock.calls[0]?.[0].update).not.toEqual(
      expect.objectContaining({
        eventId: 'evt_synthetic_2',
        idempotencyKey: 'lead-submitted:lead_synthetic_2',
      }),
    );

    const serializedPersistence = JSON.stringify(prisma.leadLifecycleEvent.upsert.mock.calls[0]?.[0]);
    expect(serializedPersistence).not.toContain('person@example.test');
    expect(serializedPersistence).not.toContain('Synthetic raw product interest message');
    expect(serializedPersistence).not.toContain('synthetic-confirmation-token');
    expect(serializedPersistence).not.toContain('private/path');
    expect(loggingService.log).toHaveBeenCalled();
  });
});
