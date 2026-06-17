import { LeadsService } from './leads.service';

const approvalEvidence = {
  approvalId: 'approval_synthetic_25',
  campaignId: 'campaign_synthetic_25',
  approvedBy: 'auth_user_synthetic_reviewer',
  approvedAt: '2026-06-13T20:00:00.000Z',
  workspaceId: 'workspace_synthetic_25',
  purposeCode: 'product_nurture' as const,
  channel: 'email' as const,
  audienceCount: 12,
  eligibleCount: 10,
  contentVersion: 'content_version_synthetic_25',
  retentionExpectation: 'marketing_retains_until_campaign_audit_window_expires' as const,
};

function createService() {
  const prisma = {
    lead: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
    },
    leadLifecycleEvent: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    leadMarketingApprovalEvidence: {
      upsert: jest.fn().mockResolvedValue({}),
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

describe('LeadsService sanitized AI/CRM context', () => {
  it('returns a minimized one-lead context without sensitive field values', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique.mockResolvedValueOnce({
      id: 'lead_synthetic_context',
      status: 'new',
      sourceService: 'statex',
      sourceUrl: 'https://statex.example/private/path?token=synthetic-url-token',
      sourceLabel: 'contact-form',
      message: 'Synthetic raw product interest message.',
      preferredChannel: 'email',
      fallbackChannels: ['telegram'],
      marketingConsent: true,
      consentSource: 'private-consent-source:v1',
      consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
      confirmedAt: null,
      unsubscribedAt: null,
      confirmationToken: 'synthetic-confirmation-token',
      contactMethods: [
        { type: 'email', value: 'person@example.test' },
        { type: 'telegram', value: '@synthetic_person' },
      ],
      submissions: [
        {
          payloadJson: {
            metadata: {
              privateCampaign: 'synthetic-private-campaign-value',
            },
          },
        },
      ],
    });

    const result = await service.getSanitizedLeadContext('lead_synthetic_context');

    expect(result).toEqual({
      contractVersion: '2026-06-13.ai-crm-context.v1',
      context: expect.objectContaining({
        leadId: 'lead_synthetic_context',
        sourceHost: 'statex.example',
        messageLength: 39,
        contactMethodCount: 2,
        contactMethodTypes: ['email', 'telegram'],
        metadataKeys: ['privateCampaign'],
        consent: {
          marketingConsent: true,
          consentSourcePresent: true,
          consentCapturedAtPresent: true,
        },
      }),
    });
    expect(prisma.lead.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'lead_synthetic_context' },
        select: expect.objectContaining({
          submissions: expect.objectContaining({ take: 1 }),
        }),
      }),
    );

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('@synthetic_person');
    expect(serialized).not.toContain('Synthetic raw product interest message');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('private/path');
    expect(serialized).not.toContain('synthetic-url-token');
    expect(serialized).not.toContain('synthetic-private-campaign-value');
    expect(serialized).not.toContain('private-consent-source:v1');
  });

  it('returns not found for missing sanitized context leads', async () => {
    const { service } = createService();

    await expect(service.getSanitizedLeadContext('lead_missing')).rejects.toThrow('Lead not found');
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
      approvalEvidence,
      requestedChannels: ['email'],
      campaignPurpose: 'marketing',
      requireConfirmedContact: true,
    });

    expect(result.contactMethods).toEqual([{ type: 'email', value: 'person@example.test', isPrimary: true }]);
    expect(result.approvalEvidence).toEqual(
      expect.objectContaining({
        approvalId: 'approval_synthetic_25',
        campaignId: 'campaign_synthetic_25',
        purposeCode: 'product_nurture',
        channel: 'email',
        humanApprovalReferencePresent: true,
      }),
    );
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['lead_synthetic_campaign'] } },
      }),
    );
    expect(prisma.leadMarketingApprovalEvidence.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          idempotencyKey:
            'marketing-approval-evidence:lead_synthetic_campaign:approval_synthetic_25:campaign_synthetic_25:email:2026-06-13T20:00:00.000Z',
        },
        create: expect.objectContaining({
          leadId: 'lead_synthetic_campaign',
          approvalId: 'approval_synthetic_25',
          campaignId: 'campaign_synthetic_25',
          purposeCode: 'product_nurture',
          channel: 'email',
          approvedByPresent: true,
          workspaceIdPresent: true,
          contentVersionPresent: true,
          eligibilityEligible: true,
          eligibilityReasons: ['eligible_contact_resolution'],
          returnedContactMethodCount: 1,
        }),
      }),
    );
    const serializedStorage = JSON.stringify(prisma.leadMarketingApprovalEvidence.upsert.mock.calls[0]?.[0]);
    expect(serializedStorage).not.toContain('person@example.test');
    expect(serializedStorage).not.toContain('content_version_synthetic_25');
    expect(serializedStorage).not.toContain('auth_user_synthetic_reviewer');
    expect(serializedStorage).not.toContain('workspace_synthetic_25');
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
      approvalEvidence,
      requestedChannels: ['email'],
      campaignPurpose: 'marketing',
      requireConfirmedContact: true,
    });

    expect(result.contactMethods).toEqual([]);
    expect(result).toEqual(
      expect.objectContaining({
        approvalEvidence: expect.objectContaining({
          approvalId: 'approval_synthetic_25',
          humanApprovalReferencePresent: true,
        }),
        eligibility: expect.objectContaining({
          eligible: false,
        }),
      }),
    );
    expect(prisma.leadMarketingApprovalEvidence.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          leadId: 'lead_synthetic_ineligible_campaign',
          approvalId: 'approval_synthetic_25',
          eligibilityEligible: false,
          eligibilityReasons: expect.arrayContaining(['unsubscribed']),
          returnedContactMethodCount: 0,
        }),
      }),
    );
  });

  it('rejects campaign contact resolution without structured approval evidence', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique = jest.fn().mockResolvedValue({
      id: 'lead_synthetic_missing_approval',
      marketingConsent: true,
      consentSource: 'private-consent-source:v1',
      consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
      unsubscribedAt: null,
      confirmedAt: new Date('2026-06-13T00:01:00.000Z'),
      contactMethods: [{ type: 'email', value: 'person@example.test', isPrimary: true }],
    });

    await expect(
      service.resolveLeadContact({
        leadId: 'lead_synthetic_missing_approval',
        purpose: 'approved_campaign_send',
        requestedChannels: ['email'],
        campaignPurpose: 'marketing',
      }),
    ).rejects.toThrow('Campaign approval evidence rejected');
    expect(prisma.lead.findMany).not.toHaveBeenCalled();
    expect(prisma.leadMarketingApprovalEvidence.upsert).not.toHaveBeenCalled();
  });

  it('rejects approved campaign resolution when approval channel does not match requested channel', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique = jest.fn().mockResolvedValue({
      id: 'lead_synthetic_channel_mismatch',
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

    await expect(
      service.resolveLeadContact({
        leadId: 'lead_synthetic_channel_mismatch',
        purpose: 'approved_campaign_send',
        approvalEvidence,
        requestedChannels: ['telegram'],
        campaignPurpose: 'marketing',
      }),
    ).rejects.toThrow('approval_channel_mismatch');
    expect(prisma.lead.findMany).not.toHaveBeenCalled();
    expect(prisma.leadMarketingApprovalEvidence.upsert).not.toHaveBeenCalled();
  });

  it('rejects malformed approval evidence before storage', async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique = jest.fn().mockResolvedValue({
      id: 'lead_synthetic_malformed_approval',
      marketingConsent: true,
      consentSource: 'private-consent-source:v1',
      consentCapturedAt: new Date('2026-06-13T00:00:00.000Z'),
      unsubscribedAt: null,
      confirmedAt: new Date('2026-06-13T00:01:00.000Z'),
      contactMethods: [{ type: 'email', value: 'person@example.test', isPrimary: true }],
    });

    await expect(
      service.resolveLeadContact({
        leadId: 'lead_synthetic_malformed_approval',
        purpose: 'approved_campaign_send',
        approvalEvidence: {
          ...approvalEvidence,
          approvedAt: 'not-a-date',
          audienceCount: 1,
          eligibleCount: 2,
        },
        requestedChannels: ['email'],
        campaignPurpose: 'marketing',
      }),
    ).rejects.toThrow('invalid_approved_at');
    expect(prisma.lead.findMany).not.toHaveBeenCalled();
    expect(prisma.leadMarketingApprovalEvidence.upsert).not.toHaveBeenCalled();
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




describe("LeadsService lifecycle replay", () => {
  it("returns bounded flipflop-service replay without raw lead fields", async () => {
    const { prisma, service } = createService();
    prisma.lead.findUnique.mockResolvedValueOnce({ id: "lead_synthetic_replay" });
    prisma.leadLifecycleEvent.findMany.mockResolvedValueOnce([
      {
        eventId: "evt_synthetic_product_app",
        eventType: "LeadSubmitted",
        eventVersion: 1,
        occurredAt: new Date("2026-06-13T00:00:00.000Z"),
        producer: "leads-microservice",
        leadId: "lead_synthetic_replay",
        correlationId: "lead_synthetic_replay",
        idempotencyKey: "lead-submitted:lead_synthetic_replay",
        dataClass: "minimized",
        payload: {
          leadId: "lead_synthetic_replay",
          sourceService: "flipflop-service",
          sourceHost: "flipflop.example",
          sourceUrl: "https://flipflop.example/private/path?jwt=synthetic-jwt",
          contactMethods: [{ type: "email", value: "person@example.test" }],
          message: "Synthetic raw product interest message",
          contactMethodTypes: ["email"],
          contactMethodCount: 1,
          consentEvidencePresent: true,
          confirmationToken: "synthetic-confirmation-token",
        },
        consumerRoutes: ["product-apps", "logging-analytics"],
        recordedAt: new Date("2026-06-13T00:00:01.000Z"),
      },
      {
        eventId: "evt_synthetic_marketing_only",
        eventType: "LeadPreferenceUpdated",
        eventVersion: 1,
        occurredAt: new Date("2026-06-13T00:01:00.000Z"),
        producer: "leads-microservice",
        leadId: "lead_synthetic_replay",
        dataClass: "minimized",
        payload: { leadId: "lead_synthetic_replay", marketingConsent: true },
        consumerRoutes: ["marketing"],
        recordedAt: new Date("2026-06-13T00:01:01.000Z"),
      },
    ]);

    const result = await service.getLeadLifecycleReplay("lead_synthetic_replay", {
      consumer: "flipflop-service",
      purpose: "consumer_reconciliation",
      limit: "500",
      fromOccurredAt: "2026-06-13T00:00:00.000Z",
    });

    expect(result.consumer).toBe("flipflop-service");
    expect(result.bounds.limit).toBe(30);
    expect(result.bounds.eventCount).toBe(1);
    expect(result.events.map((event) => event.eventId)).toEqual(["evt_synthetic_product_app"]);
    expect(prisma.leadLifecycleEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          leadId: "lead_synthetic_replay",
          occurredAt: { gte: new Date("2026-06-13T00:00:00.000Z") },
        },
        take: 31,
        select: expect.not.objectContaining({
          message: true,
          confirmationToken: true,
          contactMethods: true,
          submissions: true,
        }),
      }),
    );
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("person@example.test");
    expect(serialized).not.toContain("Synthetic raw product interest message");
    expect(serialized).not.toContain("synthetic-confirmation-token");
    expect(serialized).not.toContain("private/path");
    expect(serialized).not.toContain("synthetic-jwt");
  });

  it("rejects lifecycle replay consumers other than flipflop-service", async () => {
    const { prisma, service } = createService();

    await expect(
      service.getLeadLifecycleReplay("lead_synthetic_replay", {
        consumer: "marketing",
        purpose: "consumer_reconciliation",
      }),
    ).rejects.toThrow("Lifecycle replay consumer is not approved");
    expect(prisma.lead.findUnique).not.toHaveBeenCalled();
    expect(prisma.leadLifecycleEvent.findMany).not.toHaveBeenCalled();
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
    const result = await service.listAdminLeads({ limit: 30 }, { id: 'auth_global', roles: ['global:superadmin'], isGlobalAdmin: true, workspaceId: null, workspaceIds: [] });
    expect(result.items[0]).toEqual(expect.objectContaining({ id: 'lead_admin_1', sourceHost: 'shop.example', contactMethods: [{ type: 'email', isPrimary: true }], consentEvidencePresent: true }));
    expect(prisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ select: expect.not.objectContaining({ message: true, confirmationToken: true, submissions: true }) }));
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('Synthetic raw product interest message');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('private/path');
    expect(serialized).not.toContain('private-consent-source');
  });

  it('scopes admin lists to source services mapped from the active Auth workspace', async () => {
    const previous = process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
    process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = JSON.stringify({ 'workspace-alpha': ['shop-assistant', 'statex'] });
    try {
      const { prisma, service } = createService();
      await service.listAdminLeads({}, { id: 'auth_user_1', roles: ['leads.admin'], isGlobalAdmin: false, workspaceId: 'workspace-alpha', workspaceIds: ['workspace-alpha'] });
      expect(prisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { sourceService: { in: ['shop-assistant', 'statex'] } } }));
      expect(prisma.lead.count).toHaveBeenCalledWith({ where: { sourceService: { in: ['shop-assistant', 'statex'] } } });
    } finally {
      if (previous === undefined) delete process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
      else process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = previous;
    }
  });

  it('returns no admin list rows when a requested source is outside the workspace mapping', async () => {
    const previous = process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
    process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = JSON.stringify({ 'workspace-alpha': ['shop-assistant'] });
    try {
      const { prisma, service } = createService();
      await service.listAdminLeads({ sourceService: 'statex' }, { id: 'auth_user_1', roles: ['leads.admin'], isGlobalAdmin: false, workspaceId: 'workspace-alpha', workspaceIds: ['workspace-alpha'] });
      expect(prisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { sourceService: { in: [] } } }));
    } finally {
      if (previous === undefined) delete process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
      else process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = previous;
    }
  });

  it('rejects scoped admin reads when Auth omits workspace and role scopes', async () => {
    const { service } = createService();
    await expect(service.listAdminLeads({}, { id: 'auth_user_1', roles: ['leads.admin'], isGlobalAdmin: false, workspaceId: null, workspaceIds: [] })).rejects.toThrow('Missing Auth workspace or role scope');
  });

  it('scopes admin lists using Vault-mapped Auth app role keys', async () => {
    const previous = process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
    process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = JSON.stringify({ 'app:shop-assistant:admin': ['shop-assistant'] });
    try {
      const { prisma, service } = createService();
      await service.listAdminLeads({}, { id: 'auth_user_4', roles: ['app:shop-assistant:admin'], isGlobalAdmin: false, workspaceId: 'app:shop-assistant:admin', workspaceIds: ['app:shop-assistant:admin'] });
      expect(prisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { sourceService: { in: ['shop-assistant'] } } }));
    } finally {
      if (previous === undefined) delete process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
      else process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = previous;
    }
  });

  it('uses tenant-scoped detail lookup and hides leads outside the caller scope', async () => {
    const previous = process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
    process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = JSON.stringify({ 'workspace-alpha': ['shop-assistant'] });
    try {
      const { prisma, service } = createService();
      prisma.lead.findFirst.mockResolvedValueOnce(null);
      await expect(service.getAdminLeadById('lead_hidden', { id: 'auth_user_1', roles: ['leads.admin'], isGlobalAdmin: false, workspaceId: 'workspace-alpha', workspaceIds: ['workspace-alpha'] })).rejects.toThrow('Lead not found');
      expect(prisma.lead.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'lead_hidden', sourceService: { in: ['shop-assistant'] } } }));
    } finally {
      if (previous === undefined) delete process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
      else process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP = previous;
    }
  });
});
