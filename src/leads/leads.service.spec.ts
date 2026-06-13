import { LeadsService } from './leads.service';

function createService() {
  const prisma = {
    lead: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
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
