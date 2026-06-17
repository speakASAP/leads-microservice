import {
  buildLifecycleReplayResponse,
  LIFECYCLE_REPLAY_CONTRACT_VERSION,
  MAX_LIFECYCLE_REPLAY_EVENTS,
  LifecycleReplayRecord,
} from './lifecycle-replay-contract';

const requestedAt = '2026-06-13T04:00:00.000Z';

const records: LifecycleReplayRecord[] = [
  {
    eventId: 'evt_synthetic_b',
    eventType: 'LeadPreferenceUpdated',
    eventVersion: 1,
    occurredAt: new Date('2026-06-13T00:05:00.000Z'),
    producer: 'leads-microservice',
    leadId: 'lead_synthetic_replay',
    correlationId: 'lead_synthetic_replay',
    idempotencyKey: 'lead-preferences:lead_synthetic_replay:1781309100000',
    dataClass: 'minimized',
    payload: {
      leadId: 'lead_synthetic_replay',
      marketingConsent: false,
      consentEvidencePresent: true,
      preferredChannel: 'email',
      fallbackChannelCount: 1,
      unsubscribedAt: '2026-06-13T00:05:00.000Z',
      updatedAt: '2026-06-13T00:05:00.000Z',
      consentSource: 'raw-consent-source-value',
      metadata: { campaignContent: 'private campaign text' },
    },
    consumerRoutes: ['marketing', 'crm', 'logging-analytics'],
    recordedAt: new Date('2026-06-13T00:05:01.000Z'),
  },
  {
    eventId: 'evt_synthetic_a',
    eventType: 'LeadSubmitted',
    eventVersion: 1,
    occurredAt: '2026-06-13T00:00:00.000Z',
    producer: 'leads-microservice',
    leadId: 'lead_synthetic_replay',
    correlationId: 'lead_synthetic_replay',
    idempotencyKey: 'lead-submitted:lead_synthetic_replay',
    dataClass: 'minimized',
    payload: {
      leadId: 'lead_synthetic_replay',
      status: 'new',
      sourceService: 'shop-assistant',
      sourceLabel: 'pricing-interest',
      sourceHost: 'shop.example',
      sourceUrl: 'https://shop.example/private/path?jwt=synthetic-jwt',
      message: 'Synthetic raw message',
      contactMethods: [{ type: 'email', value: 'person@example.test' }],
      contactMethodTypes: ['telegram', 'email', 'email'],
      contactMethodCount: 1,
      preferredChannel: 'email',
      fallbackChannelCount: 1,
      marketingConsent: true,
      consentEvidencePresent: true,
      consentSource: 'raw-consent-source-value',
      confirmed: false,
      confirmationToken: 'synthetic-confirmation-token',
      unsubscribed: false,
      createdAt: '2026-06-13T00:00:00.000Z',
      metadata: { campaignContent: 'private campaign text' },
      sessionToken: 'synthetic-session-token',
    },
    consumerRoutes: ['product-apps', 'marketing', 'crm', 'logging-analytics'],
    recordedAt: '2026-06-13T00:00:01.000Z',
  },
  {
    eventId: 'evt_synthetic_c',
    eventType: 'LeadConvertedToUser',
    eventVersion: 1,
    occurredAt: '2026-06-13T00:10:00.000Z',
    producer: 'leads-microservice',
    leadId: 'lead_synthetic_replay',
    dataClass: 'minimized',
    payload: {
      leadId: 'lead_synthetic_replay',
      userId: 'auth_user_synthetic',
      sourceService: 'shop-assistant',
      linkMethod: 'verified_contact',
      linkedAt: '2026-06-13T00:10:00.000Z',
      email: 'person@example.test',
      jwt: 'synthetic-jwt',
    },
    consumerRoutes: ['auth', 'crm', 'marketing', 'logging-analytics'],
    recordedAt: '2026-06-13T00:10:01.000Z',
  },
  {
    eventId: 'evt_other_lead',
    eventType: 'LeadSubmitted',
    eventVersion: 1,
    occurredAt: '2026-06-13T00:00:00.000Z',
    producer: 'leads-microservice',
    leadId: 'lead_other',
    dataClass: 'minimized',
    payload: { leadId: 'lead_other', contactMethodCount: 1 },
    consumerRoutes: ['crm'],
    recordedAt: '2026-06-13T00:00:01.000Z',
  },
];

function expectNoSensitiveLeadData(serialized: string) {
  expect(serialized).not.toContain('person@example.test');
  expect(serialized).not.toContain('Synthetic raw message');
  expect(serialized).not.toContain('synthetic-confirmation-token');
  expect(serialized).not.toContain('private/path');
  expect(serialized).not.toContain('synthetic-jwt');
  expect(serialized).not.toContain('synthetic-session-token');
  expect(serialized).not.toContain('raw-consent-source-value');
  expect(serialized).not.toContain('private campaign text');
}

describe('lifecycle replay contract', () => {
  it('builds a bounded deterministic minimized replay response for a routed consumer', () => {
    const response = buildLifecycleReplayResponse(
      {
        leadId: 'lead_synthetic_replay',
        consumer: 'marketing',
        purpose: 'consumer_reconciliation',
        requestedAt,
        limit: 2,
      },
      records,
    );

    expect(response).toEqual(
      expect.objectContaining({
        contractVersion: LIFECYCLE_REPLAY_CONTRACT_VERSION,
        leadId: 'lead_synthetic_replay',
        consumer: 'marketing',
        purpose: 'consumer_reconciliation',
        requestedAt,
        dataClass: 'minimized',
        evidenceOwner: 'leads-microservice',
        centralizedLogOwner: 'logging-microservice',
        constraints: expect.objectContaining({
          guardRequired: true,
          maxEvents: MAX_LIFECYCLE_REPLAY_EVENTS,
          oneLeadScoped: true,
          contactValuesIncluded: false,
          rawMessagesIncluded: false,
          campaignExecutionAllowed: false,
          notificationDispatchAllowed: false,
        }),
        bounds: expect.objectContaining({
          limit: 2,
          eventCount: 2,
          nextCursor: '2026-06-13T00:05:00.000Z#evt_synthetic_b',
        }),
      }),
    );
    expect(response.events.map((event) => event.eventId)).toEqual(['evt_synthetic_a', 'evt_synthetic_b']);
    expect(response.events[0].payload).toEqual({
      leadId: 'lead_synthetic_replay',
      status: 'new',
      sourceService: 'shop-assistant',
      sourceLabel: 'pricing-interest',
      sourceHost: 'shop.example',
      contactMethodTypes: ['email', 'telegram'],
      contactMethodCount: 1,
      preferredChannel: 'email',
      fallbackChannelCount: 1,
      marketingConsent: true,
      consentEvidencePresent: true,
      confirmed: false,
      unsubscribed: false,
      createdAt: '2026-06-13T00:00:00.000Z',
    });

    expectNoSensitiveLeadData(JSON.stringify(response));
  });

  it('filters replay events to the requesting consumer route and time bounds', () => {
    const response = buildLifecycleReplayResponse(
      {
        leadId: 'lead_synthetic_replay',
        consumer: 'auth',
        purpose: 'conversion_linkage_replay',
        requestedAt,
        fromOccurredAt: '2026-06-13T00:00:01.000Z',
      },
      records,
    );

    expect(response.events.map((event) => event.eventType)).toEqual(['LeadConvertedToUser']);
    expect(response.events[0].payload).toEqual({
      leadId: 'lead_synthetic_replay',
      userId: 'auth_user_synthetic',
      sourceService: 'shop-assistant',
      linkMethod: 'verified_contact',
      linkedAt: '2026-06-13T00:10:00.000Z',
    });
    expectNoSensitiveLeadData(JSON.stringify(response));
  });


  it("maps flipflop-service replay to product-app lifecycle routes only", () => {
    const response = buildLifecycleReplayResponse(
      {
        leadId: "lead_synthetic_replay",
        consumer: "flipflop-service",
        purpose: "consumer_reconciliation",
        requestedAt,
        limit: MAX_LIFECYCLE_REPLAY_EVENTS,
      },
      records,
    );

    expect(response.consumer).toBe("flipflop-service");
    expect(response.bounds.limit).toBe(MAX_LIFECYCLE_REPLAY_EVENTS);
    expect(response.events.map((event) => event.eventType)).toEqual(["LeadSubmitted"]);
    expect(response.events[0].consumerRoutes).toContain("product-apps");
    expectNoSensitiveLeadData(JSON.stringify(response));
  });

  it('clamps replay limits to the maximum contract bound', () => {
    const response = buildLifecycleReplayResponse(
      {
        leadId: 'lead_synthetic_replay',
        consumer: 'crm',
        purpose: 'incident_replay',
        requestedAt,
        limit: MAX_LIFECYCLE_REPLAY_EVENTS + 1,
      },
      records,
    );

    expect(response.bounds.limit).toBe(MAX_LIFECYCLE_REPLAY_EVENTS);
    expect(response.bounds.eventCount).toBe(3);
  });
});
