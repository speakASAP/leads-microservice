import { LeadsService } from './leads.service';

function createService() {
  const prisma = {
    lead: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    leadLifecycleEvent: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  return {
    prisma,
    service: new LeadsService(prisma as any),
  };
}

describe('LeadsService list bounds', () => {
  it('clamps list retrieval to 30 items', async () => {
    const { prisma, service } = createService();

    const result = await service.listLeads({ page: 2, limit: 500 });

    expect(result.limit).toBe(30);
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 30,
        take: 30,
      }),
    );
  });

  it('uses the default max page size when limit is omitted', async () => {
    const { prisma, service } = createService();

    const result = await service.listLeads({});

    expect(result.limit).toBe(30);
    expect(result.page).toBe(1);
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 30,
      }),
    );
  });
});

describe('LeadsService campaign eligibility preview', () => {
  it('marks a lead eligible when marketing consent, evidence, confirmation, and channel are present', async () => {
    const { prisma, service } = createService();
    prisma.lead.findMany.mockResolvedValueOnce([
      {
        id: 'lead_synthetic_eligible',
        preferredChannel: 'email',
        fallbackChannels: ['telegram'],
        marketingConsent: true,
        consentSource: 'private-consent-source:v1',
        consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
        unsubscribedAt: null,
        confirmedAt: new Date('2026-06-13T00:01:00.000Z'),
        contactMethods: [{ type: 'email' }, { type: 'telegram' }],
      },
    ]);

    const result = await service.previewCampaignEligibility({
      leadIds: ['lead_synthetic_eligible'],
      campaignPurpose: 'marketing',
      channel: 'email',
      requireConfirmedContact: true,
    });

    expect(result).toEqual({
      contractVersion: '2026-06-13.lifecycle.v1',
      campaignPurpose: 'marketing',
      channel: 'email',
      requireConfirmedContact: true,
      items: [
        expect.objectContaining({
          leadId: 'lead_synthetic_eligible',
          eligible: true,
          reasons: [
            'marketing_consent_true',
            'consent_source_present',
            'consent_captured_at_present',
            'not_unsubscribed',
            'confirmed_when_required',
            'supported_channel_present',
          ],
          contactMethodTypes: ['email', 'telegram'],
          preferredChannel: 'email',
          fallbackChannelCount: 1,
          marketingConsent: true,
          consentEvidencePresent: true,
          unsubscribed: false,
          confirmed: true,
        }),
      ],
      summary: {
        requested: 1,
        eligible: 1,
        ineligible: 0,
      },
    });
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['lead_synthetic_eligible'] } },
        select: expect.not.objectContaining({
          message: true,
          sourceUrl: true,
          confirmationToken: true,
        }),
      }),
    );

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('private-consent-source:v1');
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('Synthetic raw product interest message');
    expect(serialized).not.toContain('synthetic-confirmation-token');
  });

  it('returns deterministic ineligibility reasons without contact values', async () => {
    const { prisma, service } = createService();
    prisma.lead.findMany.mockResolvedValueOnce([
      {
        id: 'lead_synthetic_ineligible',
        preferredChannel: 'telegram',
        fallbackChannels: [],
        marketingConsent: false,
        consentSource: null,
        consentCapturedAt: null,
        unsubscribedAt: new Date('2026-06-13T00:02:00.000Z'),
        confirmedAt: null,
        contactMethods: [{ type: 'telegram' }],
      },
    ]);

    const result = await service.previewCampaignEligibility({
      leadIds: ['lead_synthetic_ineligible', 'lead_synthetic_missing'],
      campaignPurpose: 'marketing',
      channel: 'email',
      requireConfirmedContact: true,
    });

    expect(result.items).toEqual([
      expect.objectContaining({
        leadId: 'lead_synthetic_ineligible',
        eligible: false,
        reasons: [
          'missing_marketing_consent',
          'missing_consent_source',
          'missing_consent_captured_at',
          'unsubscribed',
          'confirmation_required',
          'unsupported_channel',
        ],
        contactMethodTypes: ['telegram'],
      }),
      {
        leadId: 'lead_synthetic_missing',
        eligible: false,
        reasons: ['invalid_lead_id'],
        contactMethodTypes: [],
        preferredChannel: null,
        fallbackChannelCount: 0,
        marketingConsent: null,
        consentEvidencePresent: false,
        unsubscribed: false,
        confirmed: false,
      },
    ]);
    expect(result.summary).toEqual({
      requested: 2,
      eligible: 0,
      ineligible: 2,
    });
  });
});


describe('LeadsService controlled contact resolution', () => {
  it('resolves only requested channel contact values for one lead', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique = jest.fn().mockResolvedValue({
      id: 'lead_synthetic_resolution',
      marketingConsent: true,
      consentSource: 'private-consent-source:v1',
      consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
      unsubscribedAt: null,
      confirmedAt: new Date('2026-06-13T00:01:00.000Z'),
      contactMethods: [
        { type: 'email', value: 'person@example.test', isPrimary: true },
        { type: 'telegram', value: '@synthetic_person', isPrimary: false },
      ],
    });

    const result = await service.resolveLeadContact({
      leadId: 'lead_synthetic_resolution',
      purpose: 'single_lead_human_review',
      requestedChannels: ['email'],
    });

    expect(result).toEqual(
      expect.objectContaining({
        leadId: 'lead_synthetic_resolution',
        purpose: 'single_lead_human_review',
        contactMethods: [{ type: 'email', value: 'person@example.test', isPrimary: true }],
        consent: {
          marketingConsent: true,
          consentCapturedAtPresent: true,
          unsubscribed: false,
        },
      }),
    );
  });

  it('requires approval evidence and re-checks eligibility for campaign sends', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique = jest.fn().mockResolvedValue({
      id: 'lead_synthetic_campaign',
      marketingConsent: true,
      consentSource: 'private-consent-source:v1',
      consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
      unsubscribedAt: null,
      confirmedAt: new Date('2026-06-13T00:01:00.000Z'),
      contactMethods: [{ type: 'email', value: 'person@example.test', isPrimary: true }],
    });
    prisma.lead.findMany.mockResolvedValueOnce([
      {
        id: 'lead_synthetic_campaign',
        preferredChannel: 'email',
        fallbackChannels: [],
        marketingConsent: true,
        consentSource: 'private-consent-source:v1',
        consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
        unsubscribedAt: null,
        confirmedAt: new Date('2026-06-13T00:01:00.000Z'),
        contactMethods: [{ type: 'email' }],
      },
    ]);

    const result = await service.resolveLeadContact({
      leadId: 'lead_synthetic_campaign',
      purpose: 'approved_campaign_send',
      approvalId: 'approval_synthetic_1',
      requestedChannels: ['email'],
      campaignPurpose: 'marketing',
      requireConfirmedContact: true,
    });

    expect(result.contactMethods).toEqual([{ type: 'email', value: 'person@example.test', isPrimary: true }]);
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['lead_synthetic_campaign'] } },
      }),
    );
  });

  it('does not resolve campaign contacts when eligibility re-check fails', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique = jest.fn().mockResolvedValue({
      id: 'lead_synthetic_ineligible_campaign',
      marketingConsent: false,
      consentSource: null,
      consentCapturedAt: null,
      unsubscribedAt: new Date('2026-06-13T00:02:00.000Z'),
      confirmedAt: null,
      contactMethods: [{ type: 'email', value: 'person@example.test', isPrimary: true }],
    });
    prisma.lead.findMany.mockResolvedValueOnce([
      {
        id: 'lead_synthetic_ineligible_campaign',
        preferredChannel: 'email',
        fallbackChannels: [],
        marketingConsent: false,
        consentSource: null,
        consentCapturedAt: null,
        unsubscribedAt: new Date('2026-06-13T00:02:00.000Z'),
        confirmedAt: null,
        contactMethods: [{ type: 'email' }],
      },
    ]);

    const result = await service.resolveLeadContact({
      leadId: 'lead_synthetic_ineligible_campaign',
      purpose: 'approved_campaign_send',
      approvalId: 'approval_synthetic_1',
      requestedChannels: ['email'],
      campaignPurpose: 'marketing',
      requireConfirmedContact: true,
    });

    expect(result.contactMethods).toEqual([]);
    expect(result).toEqual(
      expect.objectContaining({
        eligibility: expect.objectContaining({
          eligible: false,
        }),
      }),
    );
  });
});


describe('LeadsService lifecycle event retrieval', () => {
  it('returns one-lead minimized lifecycle events without raw lead fields', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique.mockResolvedValueOnce({ id: 'lead_synthetic_events' });
    prisma.leadLifecycleEvent.findMany.mockResolvedValueOnce([
      {
        eventId: 'evt_synthetic_3',
        eventType: 'LeadSubmitted',
        eventVersion: 1,
        occurredAt: new Date('2026-06-13T00:00:00.000Z'),
        producer: 'leads-microservice',
        leadId: 'lead_synthetic_events',
        correlationId: 'lead_synthetic_events',
        idempotencyKey: 'lead-submitted:lead_synthetic_events',
        dataClass: 'minimized',
        payload: {
          leadId: 'lead_synthetic_events',
          sourceService: 'shop-assistant',
          sourceHost: 'shop.example',
          contactMethodTypes: ['email'],
          contactMethodCount: 1,
          consentEvidencePresent: true,
        },
        consumerRoutes: ['crm', 'marketing', 'logging-analytics'],
        recordedAt: new Date('2026-06-13T00:00:01.000Z'),
      },
    ]);

    const result = await service.getLeadLifecycleEvents('lead_synthetic_events');

    expect(result).toEqual({
      leadId: 'lead_synthetic_events',
      contractVersion: '2026-06-13.lifecycle.v1',
      events: [
        expect.objectContaining({
          eventId: 'evt_synthetic_3',
          eventType: 'LeadSubmitted',
          occurredAt: '2026-06-13T00:00:00.000Z',
          recordedAt: '2026-06-13T00:00:01.000Z',
          dataClass: 'minimized',
        }),
      ],
    });
    expect(prisma.leadLifecycleEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { leadId: 'lead_synthetic_events' },
        select: expect.not.objectContaining({
          message: true,
          confirmationToken: true,
          contactMethods: true,
          submissions: true,
        }),
      }),
    );
    expect(JSON.stringify(result)).not.toContain('person@example.test');
    expect(JSON.stringify(result)).not.toContain('Synthetic raw product interest message');
    expect(JSON.stringify(result)).not.toContain('synthetic-confirmation-token');
    expect(JSON.stringify(result)).not.toContain('private/path');
  });
});


describe('LeadsService Auth-backed admin views', () => {
  it('returns masked admin list without raw message, contact value, token, source path, or consent source', async () => {
    const { prisma, service } = createService();
    prisma.lead.findMany.mockResolvedValueOnce([
      {
        id: 'lead_admin_1', status: 'new', sourceService: 'shop-assistant',
        sourceUrl: 'https://shop.example/private/path?token=synthetic-token', sourceLabel: 'pricing',
        preferredChannel: 'email', fallbackChannels: ['telegram'], marketingConsent: true,
        consentSource: 'private-consent-source:v1', consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
        confirmedAt: null, unsubscribedAt: null, createdAt: new Date('2026-06-13T00:00:00.000Z'), updatedAt: new Date('2026-06-13T00:00:00.000Z'),
        contactMethods: [{ type: 'email', isPrimary: true }],
      },
    ]);
    prisma.lead.count.mockResolvedValueOnce(1);
    const result = await service.listAdminLeads({ limit: 30 });
    expect(result.items[0]).toEqual(expect.objectContaining({ id: 'lead_admin_1', sourceHost: 'shop.example', contactMethods: [{ type: 'email', isPrimary: true }], consentEvidencePresent: true }));
    expect(prisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ select: expect.not.objectContaining({ message: true, confirmationToken: true, submissions: true }) }));
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('Synthetic raw product interest message');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('private/path');
    expect(serialized).not.toContain('private-consent-source');
  });
});
