import {
  buildLeadConfirmedEvent,
  buildLeadConvertedToUserEvent,
  buildLeadPreferenceUpdatedEvent,
  buildLeadSubmittedEvent,
} from './lifecycle-events';

const eventOptions = {
  eventId: 'event_synthetic_1',
  occurredAt: '2026-06-13T00:00:00.000Z',
  correlationId: 'correlation_synthetic',
  idempotencyKey: 'idempotency_synthetic',
};

const sensitiveLeadInput = {
  id: 'lead_synthetic_1',
  status: 'new',
  sourceService: 'shop-assistant',
  sourceUrl: 'https://shop.example/private/cart?token=synthetic-url-token',
  sourceLabel: 'pricing-interest',
  message: 'Synthetic raw message with private buying intent.',
  contactMethods: [
    { type: 'email', value: 'person@example.test' },
    { type: 'telegram', value: '@synthetic_person' },
  ],
  metadata: {
    privateCampaign: 'synthetic-private-campaign-value',
  },
  preferredChannel: 'email',
  fallbackChannels: ['telegram'],
  marketingConsent: true,
  consentSource: 'shop-assistant-pricing-form:v1',
  consentCapturedAt: '2026-06-13T00:00:00.000Z',
  confirmedAt: null,
  unsubscribedAt: null,
  createdAt: '2026-06-13T00:00:00.000Z',
  updatedAt: '2026-06-13T00:05:00.000Z',
  confirmationToken: 'synthetic-confirmation-token',
};

function expectNoSensitiveLeadData(serialized: string) {
  expect(serialized).not.toContain('person@example.test');
  expect(serialized).not.toContain('@synthetic_person');
  expect(serialized).not.toContain('Synthetic raw message');
  expect(serialized).not.toContain('synthetic-confirmation-token');
  expect(serialized).not.toContain('private/cart');
  expect(serialized).not.toContain('synthetic-url-token');
  expect(serialized).not.toContain('synthetic-private-campaign-value');
  expect(serialized).not.toContain('shop-assistant-pricing-form:v1');
}

describe('lifecycle event builders', () => {
  it('builds a minimized LeadSubmitted event', () => {
    const event = buildLeadSubmittedEvent(sensitiveLeadInput, eventOptions);

    expect(event).toEqual({
      eventId: 'event_synthetic_1',
      eventType: 'LeadSubmitted',
      eventVersion: 1,
      occurredAt: '2026-06-13T00:00:00.000Z',
      producer: 'leads-microservice',
      leadId: 'lead_synthetic_1',
      correlationId: 'correlation_synthetic',
      idempotencyKey: 'idempotency_synthetic',
      dataClass: 'minimized',
      payload: {
        leadId: 'lead_synthetic_1',
        status: 'new',
        sourceService: 'shop-assistant',
        sourceLabel: 'pricing-interest',
        sourceHost: 'shop.example',
        contactMethodTypes: ['email', 'telegram'],
        contactMethodCount: 2,
        preferredChannel: 'email',
        fallbackChannelCount: 1,
        marketingConsent: true,
        consentEvidencePresent: true,
        confirmed: false,
        unsubscribed: false,
        createdAt: '2026-06-13T00:00:00.000Z',
      },
    });

    expectNoSensitiveLeadData(JSON.stringify(event));
  });

  it('builds a minimized LeadConfirmed event', () => {
    const event = buildLeadConfirmedEvent(
      {
        id: 'lead_synthetic_1',
        sourceService: 'speakup',
        confirmedAt: '2026-06-13T00:10:00.000Z',
      },
      eventOptions,
    );

    expect(event.payload).toEqual({
      leadId: 'lead_synthetic_1',
      sourceService: 'speakup',
      confirmedAt: '2026-06-13T00:10:00.000Z',
    });
    expect(JSON.stringify(event)).not.toContain('confirmation');
  });

  it('requires confirmedAt for LeadConfirmed', () => {
    expect(() =>
      buildLeadConfirmedEvent(
        {
          id: 'lead_synthetic_1',
          sourceService: 'speakup',
          confirmedAt: null,
        },
        eventOptions,
      ),
    ).toThrow('confirmedAt is required');
  });

  it('builds a minimized LeadPreferenceUpdated event', () => {
    const event = buildLeadPreferenceUpdatedEvent(
      {
        ...sensitiveLeadInput,
        marketingConsent: false,
        unsubscribedAt: '2026-06-13T00:20:00.000Z',
      },
      eventOptions,
    );

    expect(event.payload).toEqual({
      leadId: 'lead_synthetic_1',
      marketingConsent: false,
      consentEvidencePresent: true,
      preferredChannel: 'email',
      fallbackChannelCount: 1,
      unsubscribedAt: '2026-06-13T00:20:00.000Z',
      updatedAt: '2026-06-13T00:05:00.000Z',
    });
    expectNoSensitiveLeadData(JSON.stringify(event));
  });

  it('builds a minimized LeadConvertedToUser event', () => {
    const event = buildLeadConvertedToUserEvent(
      {
        leadId: 'lead_synthetic_1',
        userId: 'auth_user_synthetic_1',
        sourceService: 'marathon',
        linkMethod: 'verified_contact',
        linkedAt: '2026-06-13T00:30:00.000Z',
      },
      eventOptions,
    );

    expect(event.payload).toEqual({
      leadId: 'lead_synthetic_1',
      userId: 'auth_user_synthetic_1',
      sourceService: 'marathon',
      linkMethod: 'verified_contact',
      linkedAt: '2026-06-13T00:30:00.000Z',
    });
  });
});
