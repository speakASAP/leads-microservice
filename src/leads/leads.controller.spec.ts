import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { InternalServiceGuard } from './guards/internal-service.guard';
import { LeadsController } from './leads.controller';

function guardsFor(method: keyof LeadsController) {
  return Reflect.getMetadata(GUARDS_METADATA, LeadsController.prototype[method]) ?? [];
}

function buildController(leadsService: Record<string, unknown>) {
  const loggingService = {
    log: jest.fn().mockResolvedValue(undefined),
  };
  const lifecycleEventRouter = {
    route: jest.fn().mockResolvedValue({
      consumerRoutes: ['crm', 'marketing', 'logging-analytics'],
    }),
  };
  const notificationsService = {
    sendLeadConfirmation: jest.fn().mockResolvedValue(true),
  };
  const controller = new LeadsController(
    leadsService as never,
    loggingService as never,
    lifecycleEventRouter as never,
    notificationsService as never,
  );

  return { controller, loggingService, lifecycleEventRouter, notificationsService };
}

describe('LeadsController access controls', () => {
  it('guards raw lead detail retrieval', () => {
    expect(guardsFor('getLead')).toContain(InternalServiceGuard);
  });

  it('guards raw lead list retrieval', () => {
    expect(guardsFor('listLeads')).toContain(InternalServiceGuard);
  });

  it('keeps internal preference, unsubscribe, and conversion-link routes guarded', () => {
    expect(guardsFor('getLeadPreferences')).toContain(InternalServiceGuard);
    expect(guardsFor('updateLeadPreferences')).toContain(InternalServiceGuard);
    expect(guardsFor('unsubscribeLead')).toContain(InternalServiceGuard);
    expect(guardsFor('linkLeadToUser')).toContain(InternalServiceGuard);
  });

  it('does not require internal service credentials for public intake or confirmation', () => {
    expect(guardsFor('submitLead')).not.toContain(InternalServiceGuard);
    expect(guardsFor('confirmLead')).not.toContain(InternalServiceGuard);
  });
});

describe('LeadsController lifecycle routing', () => {
  it('routes a minimized LeadSubmitted lifecycle event after public intake', async () => {
    const { controller, lifecycleEventRouter } = buildController({
      createLead: jest.fn().mockResolvedValue({
        id: 'lead_synthetic_1',
        status: 'new',
        sourceService: 'shop-assistant',
        sourceUrl: 'https://shop.example/private/cart?token=synthetic-url-token',
        sourceLabel: 'pricing-interest',
        contactMethods: [
          { type: 'email', value: 'person@example.test' },
          { type: 'telegram', value: '@synthetic_person' },
        ],
        preferredChannel: 'email',
        fallbackChannels: ['telegram'],
        marketingConsent: true,
        consentSource: 'shop-assistant-pricing:v1',
        consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
        confirmedAt: null,
        unsubscribedAt: null,
        createdAt: new Date('2026-06-13T00:00:00.000Z'),
      }),
    });

    const result = await controller.submitLead({
      sourceService: 'shop-assistant',
      sourceUrl: 'https://shop.example/private/cart?token=synthetic-url-token',
      sourceLabel: 'pricing-interest',
      message: 'Synthetic raw product interest message.',
      contactMethods: [
        { type: 'email', value: 'person@example.test' },
        { type: 'telegram', value: '@synthetic_person' },
      ],
      preferredChannel: 'email',
      fallbackChannels: ['telegram'],
      marketingConsent: true,
      consentSource: 'shop-assistant-pricing:v1',
      consentCapturedAt: '2026-06-13T00:00:00.000Z',
      metadata: {
        privateValue: 'synthetic-private-metadata-value',
      },
    });

    expect(result).toEqual({
      leadId: 'lead_synthetic_1',
      status: 'new',
      confirmationSent: true,
    });
    expect(lifecycleEventRouter.route).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'LeadSubmitted',
        leadId: 'lead_synthetic_1',
        idempotencyKey: 'lead-submitted:lead_synthetic_1',
        payload: expect.objectContaining({
          leadId: 'lead_synthetic_1',
          sourceService: 'shop-assistant',
          sourceHost: 'shop.example',
          contactMethodTypes: ['email', 'telegram'],
          contactMethodCount: 2,
          consentEvidencePresent: true,
        }),
      }),
    );

    const serialized = JSON.stringify(lifecycleEventRouter.route.mock.calls[0]?.[0]);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('@synthetic_person');
    expect(serialized).not.toContain('Synthetic raw product interest message');
    expect(serialized).not.toContain('private/cart');
    expect(serialized).not.toContain('synthetic-url-token');
    expect(serialized).not.toContain('synthetic-private-metadata-value');
    expect(serialized).not.toContain('shop-assistant-pricing:v1');
  });

  it('routes a minimized LeadConfirmed lifecycle event without changing confirmation response', async () => {
    const { controller, lifecycleEventRouter } = buildController({
      confirmLead: jest.fn().mockResolvedValue({
        id: 'lead_synthetic_2',
        sourceService: 'speakup',
        sourceUrl: 'https://speakup.example/private/path?token=synthetic-token',
        email: 'person@example.test',
      }),
    });

    const result = await controller.confirmLead('synthetic-confirmation-token');

    expect(result).toEqual({
      id: 'lead_synthetic_2',
      sourceService: 'speakup',
      sourceUrl: 'https://speakup.example/private/path?token=synthetic-token',
      email: 'person@example.test',
    });
    expect(lifecycleEventRouter.route).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'LeadConfirmed',
        leadId: 'lead_synthetic_2',
        idempotencyKey: 'lead-confirmed:lead_synthetic_2',
        payload: expect.objectContaining({
          leadId: 'lead_synthetic_2',
          sourceService: 'speakup',
          confirmedAt: expect.any(String),
        }),
      }),
    );

    const serialized = JSON.stringify(lifecycleEventRouter.route.mock.calls[0]?.[0]);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('synthetic-token');
    expect(serialized).not.toContain('private/path');
  });

  it('routes a minimized LeadPreferenceUpdated lifecycle event after preference update', async () => {
    const updatedAt = new Date('2026-06-13T01:00:00.000Z');
    const { controller, lifecycleEventRouter } = buildController({
      updateLeadPreferences: jest.fn().mockResolvedValue({
        id: 'lead_synthetic_3',
        preferredChannel: 'telegram',
        fallbackChannels: ['email', 'sms'],
        marketingConsent: true,
        consentSource: 'private-consent-source:v2',
        consentCapturedAt: new Date('2026-06-13T00:59:00.000Z'),
        unsubscribedAt: null,
        updatedAt,
      }),
    });

    const result = await controller.updateLeadPreferences('lead_synthetic_3', {
      preferredChannel: 'telegram',
      fallbackChannels: ['email', 'sms'],
      marketingConsent: true,
      consentSource: 'private-consent-source:v2',
      consentCapturedAt: '2026-06-13T00:59:00.000Z',
    });

    expect(result.id).toBe('lead_synthetic_3');
    expect(lifecycleEventRouter.route).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'LeadPreferenceUpdated',
        leadId: 'lead_synthetic_3',
        idempotencyKey: 'lead-preference-updated:lead_synthetic_3:1781312400000',
        payload: expect.objectContaining({
          leadId: 'lead_synthetic_3',
          marketingConsent: true,
          consentEvidencePresent: true,
          preferredChannel: 'telegram',
          fallbackChannelCount: 2,
          updatedAt: '2026-06-13T01:00:00.000Z',
        }),
      }),
    );

    const serialized = JSON.stringify(lifecycleEventRouter.route.mock.calls[0]?.[0]);
    expect(serialized).not.toContain('private-consent-source:v2');
  });

  it('routes a minimized LeadPreferenceUpdated lifecycle event after unsubscribe', async () => {
    const unsubscribedAt = new Date('2026-06-13T02:00:00.000Z');
    const { controller, lifecycleEventRouter } = buildController({
      unsubscribeLead: jest.fn().mockResolvedValue({
        id: 'lead_synthetic_4',
        unsubscribedAt,
        updatedAt: unsubscribedAt,
      }),
    });

    const result = await controller.unsubscribeLead('lead_synthetic_4');

    expect(result).toEqual({
      id: 'lead_synthetic_4',
      unsubscribedAt,
      updatedAt: unsubscribedAt,
    });
    expect(lifecycleEventRouter.route).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'LeadPreferenceUpdated',
        leadId: 'lead_synthetic_4',
        idempotencyKey: 'lead-preference-updated:lead_synthetic_4:1781316000000',
        payload: expect.objectContaining({
          leadId: 'lead_synthetic_4',
          marketingConsent: false,
          consentEvidencePresent: false,
          unsubscribedAt: '2026-06-13T02:00:00.000Z',
          updatedAt: '2026-06-13T02:00:00.000Z',
        }),
      }),
    );
  });

  it('routes a minimized LeadConvertedToUser event for guarded Auth conversion linkage', async () => {
    const linkedAt = '2026-06-13T03:00:00.000Z';
    const { controller, lifecycleEventRouter } = buildController({
      getLeadConversionSource: jest.fn().mockResolvedValue({
        id: 'lead_synthetic_5',
        sourceService: 'marathon',
      }),
    });
    lifecycleEventRouter.route.mockResolvedValueOnce({
      consumerRoutes: ['auth', 'crm', 'marketing', 'logging-analytics'],
    });

    const result = await controller.linkLeadToUser('lead_synthetic_5', {
      userId: 'auth_user_synthetic_1',
      linkMethod: 'verified_contact',
      linkedAt,
    });

    expect(result).toEqual(
      expect.objectContaining({
        leadId: 'lead_synthetic_5',
        userId: 'auth_user_synthetic_1',
        linkMethod: 'verified_contact',
        linkedAt,
        lifecycleEventId: expect.any(String),
        consumerRoutes: ['auth', 'crm', 'marketing', 'logging-analytics'],
      }),
    );
    expect(lifecycleEventRouter.route).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'LeadConvertedToUser',
        leadId: 'lead_synthetic_5',
        idempotencyKey:
          'lead-converted-to-user:lead_synthetic_5:auth_user_synthetic_1:verified_contact:1781319600000',
        payload: {
          leadId: 'lead_synthetic_5',
          userId: 'auth_user_synthetic_1',
          sourceService: 'marathon',
          linkMethod: 'verified_contact',
          linkedAt,
        },
      }),
    );

    const serialized = JSON.stringify(lifecycleEventRouter.route.mock.calls[0]?.[0]);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('private/path');
    expect(serialized).not.toContain('jwt');
  });
});
