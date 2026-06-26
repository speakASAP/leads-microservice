import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuthUser } from '../auth/admin-auth.guard';
import { CampaignEligibilityPreviewDto } from './dto/campaign-eligibility-preview.dto';
import { ContactResolutionDto } from './dto/contact-resolution.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadPreferencesDto } from './dto/update-lead-preferences.dto';
import { buildSanitizedAiCrmLeadContext } from './integrations/ai-crm-payload';
import {
  buildMarketingApprovalEvidenceStorageRecord,
  buildMarketingApprovalEvidenceSummary,
  validateMarketingApprovalEvidenceForContactResolution,
} from './integrations/marketing-approval-evidence';
import {
  buildLifecycleReplayResponse,
  LifecycleReplayPurpose,
  normalizeLifecycleReplayLimit,
} from "./integrations/lifecycle-replay-contract";

function metadataFromSubmissionPayload(payloadJson: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
  if (!payloadJson || typeof payloadJson !== 'object' || Array.isArray(payloadJson)) {
    return null;
  }
  const metadata = (payloadJson as Record<string, unknown>).metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }
  return metadata as Record<string, unknown>;
}

function sourceHostForAdmin(sourceUrl?: string | null): string | null {
  if (!sourceUrl) {
    return null;
  }
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

type AdminLeadScope = Pick<AdminAuthUser, 'isGlobalAdmin' | 'workspaceId' | 'workspaceIds'>;

function configuredWorkspaceSourceMap(): Record<string, string[]> {
  const raw = process.env.LEADS_ADMIN_WORKSPACE_SOURCE_MAP;
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([workspaceId, value]) => {
        if (Array.isArray(value)) {
          return [workspaceId, value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim())];
        }
        if (typeof value === 'string') {
          return [workspaceId, value.split(',').map((item) => item.trim()).filter(Boolean)];
        }
        return [workspaceId, []];
      }),
    );
  } catch {
    throw new ForbiddenException('Invalid Leads admin workspace source mapping');
  }
}

function allowedSourceServicesForAdmin(scope: AdminLeadScope): string[] | undefined {
  if (scope.isGlobalAdmin) {
    return undefined;
  }

  const scopeKeys = new Set<string>();
  if (scope.workspaceId) {
    scopeKeys.add(scope.workspaceId);
  }
  scope.workspaceIds.forEach((workspaceId) => scopeKeys.add(workspaceId));
  if (!scopeKeys.size) {
    throw new ForbiddenException('Missing Auth workspace or role scope');
  }

  const sourceMap = configuredWorkspaceSourceMap();
  const sourceServices = new Set<string>();
  scopeKeys.forEach((scopeKey) => {
    sourceMap[scopeKey]?.forEach((sourceService) => sourceServices.add(sourceService));
  });
  if (!sourceServices.size) {
    throw new ForbiddenException('No Leads source mapping for Auth workspace or role scope');
  }
  return Array.from(sourceServices);
}

function scopedAdminLeadWhere(query: LeadQueryDto, scope: AdminLeadScope): Prisma.LeadWhereInput {
  const allowedSourceServices = allowedSourceServicesForAdmin(scope);
  const where: Prisma.LeadWhereInput = {};

  if (query.sourceService) {
    where.sourceService = allowedSourceServices && !allowedSourceServices.includes(query.sourceService)
      ? { in: [] }
      : query.sourceService;
  } else if (allowedSourceServices) {
    where.sourceService = { in: allowedSourceServices };
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) {
      where.createdAt.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.createdAt.lte = new Date(query.endDate);
    }
  }

  return where;
}


const FLIPFLOP_REPLAY_CONSUMER = "flipflop-service";
const lifecycleReplayPurposes = new Set<LifecycleReplayPurpose>([
  "consumer_reconciliation",
  "incident_replay",
  "consent_audit",
  "conversion_linkage_replay",
]);

type LifecycleReplayQuery = {
  consumer?: string | null;
  purpose?: LifecycleReplayPurpose | string | null;
  limit?: number | string | null;
  fromOccurredAt?: string | null;
  toOccurredAt?: string | null;
};

function parseOptionalReplayDate(value: string | null | undefined, fieldName: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${fieldName} must be a valid ISO date`);
  }

  return parsed;
}

function parseOptionalReplayLimit(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  private toAdminLeadSummary(lead: {
    id: string;
    status: string;
    sourceService: string;
    sourceUrl?: string | null;
    sourceLabel?: string | null;
    preferredChannel?: string | null;
    fallbackChannels?: Prisma.JsonValue | null;
    marketingConsent?: boolean | null;
    consentSource?: string | null;
    consentCapturedAt?: Date | null;
    confirmedAt?: Date | null;
    unsubscribedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    contactMethods: Array<{ type: string; isPrimary: boolean }>;
  }) {
    return {
      id: lead.id,
      status: lead.status,
      sourceService: lead.sourceService,
      sourceLabel: lead.sourceLabel ?? null,
      sourceHost: sourceHostForAdmin(lead.sourceUrl),
      preferredChannel: lead.preferredChannel ?? null,
      fallbackChannelCount: Array.isArray(lead.fallbackChannels) ? lead.fallbackChannels.length : 0,
      marketingConsent: lead.marketingConsent ?? null,
      consentEvidencePresent: Boolean(lead.consentSource && lead.consentCapturedAt),
      confirmedAt: lead.confirmedAt,
      unsubscribedAt: lead.unsubscribedAt,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      contactMethods: lead.contactMethods.map((method) => ({
        type: method.type,
        isPrimary: method.isPrimary,
      })),
    };
  }

  async getAdminLeadSummary(adminUser: AdminAuthUser) {
    const where = scopedAdminLeadWhere({}, adminUser);
    const [total, confirmed, consented, unsubscribed] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.count({ where: { ...where, confirmedAt: { not: null } } }),
      this.prisma.lead.count({ where: { ...where, marketingConsent: true, unsubscribedAt: null } }),
      this.prisma.lead.count({ where: { ...where, unsubscribedAt: { not: null } } }),
    ]);
    return { total, confirmed, consented, unsubscribed };
  }

  async listAdminLeads(query: LeadQueryDto, adminUser: AdminAuthUser) {
    const limit = Math.min(query.limit || 30, 30);
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const where = scopedAdminLeadWhere(query, adminUser);
    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        select: {
          id: true, status: true, sourceService: true, sourceUrl: true, sourceLabel: true, preferredChannel: true,
          fallbackChannels: true, marketingConsent: true, consentSource: true, consentCapturedAt: true,
          confirmedAt: true, unsubscribedAt: true, createdAt: true, updatedAt: true,
          contactMethods: { select: { type: true, isPrimary: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);
    return { items: items.map((lead) => this.toAdminLeadSummary(lead)), page, limit, total };
  }

  async getAdminLeadById(id: string, adminUser: AdminAuthUser) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, ...scopedAdminLeadWhere({}, adminUser) },
      select: {
        id: true, status: true, sourceService: true, sourceUrl: true, sourceLabel: true, preferredChannel: true,
        fallbackChannels: true, marketingConsent: true, consentSource: true, consentCapturedAt: true,
        confirmedAt: true, unsubscribedAt: true, createdAt: true, updatedAt: true,
        contactMethods: { select: { type: true, isPrimary: true } },
      },
    });
    if (!lead) {
      throw new NotFoundException("Lead not found");
    }
    return this.toAdminLeadSummary(lead);
  }

  async createLead(payload: CreateLeadDto) {
    const primaryIndex = payload.contactMethods.findIndex((method) => method.type && method.value);
    const contactMethods = payload.contactMethods.map((method, index) => ({
      type: method.type,
      value: method.value,
      isPrimary: index === primaryIndex,
    }));

    const payloadJson: Prisma.JsonObject = {
      sourceService: payload.sourceService,
      sourceUrl: payload.sourceUrl ?? null,
      sourceLabel: payload.sourceLabel ?? null,
      message: payload.message,
      contactMethods: payload.contactMethods.map((method) => ({
        type: method.type,
        value: method.value,
      })),
      metadata: payload.metadata ? (payload.metadata as Prisma.JsonValue) : null,
      preferredChannel: payload.preferredChannel ?? null,
      fallbackChannels: payload.fallbackChannels ?? null,
      marketingConsent: payload.marketingConsent ?? null,
      consentSource: payload.consentSource ?? null,
      consentCapturedAt: payload.consentCapturedAt ?? null,
    };

    const confirmationToken = randomBytes(32).toString('hex');

    const lead = await this.prisma.lead.create({
      data: {
        status: 'new',
        confirmationToken,
        sourceService: payload.sourceService,
        sourceUrl: payload.sourceUrl,
        sourceLabel: payload.sourceLabel,
        message: payload.message,
        preferredChannel: payload.preferredChannel ?? null,
        fallbackChannels: (payload.fallbackChannels ?? null) as Prisma.InputJsonValue | null,
        marketingConsent: payload.marketingConsent ?? null,
        consentSource: payload.consentSource ?? null,
        consentCapturedAt: payload.consentCapturedAt ? new Date(payload.consentCapturedAt) : null,
        contactMethods: {
          create: contactMethods,
        },
        submissions: {
          create: {
            payloadJson,
          },
        },
      },
      include: {
        contactMethods: true,
      },
    });

    return lead;
  }

  async getLeadById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        contactMethods: true,
        submissions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async listMarketingRecipients(query: Record<string, string | undefined>) {
    const parsedLimit = Number(query.limit ?? 30);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(Math.floor(parsedLimit), 1), 100) : 30;
    const sourceService = query.sourceService || query.signalSourceService || query.appId;
    const where: Prisma.LeadWhereInput = {};
    if (sourceService) {
      where.sourceService = sourceService;
    }

    const leads = await this.prisma.lead.findMany({
      where,
      select: {
        id: true,
        sourceService: true,
        preferredChannel: true,
        fallbackChannels: true,
        marketingConsent: true,
        consentSource: true,
        consentCapturedAt: true,
        unsubscribedAt: true,
        confirmedAt: true,
        createdAt: true,
        updatedAt: true,
        contactMethods: {
          select: { type: true, value: true, isPrimary: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      recipients: leads.map((lead) => {
        const email = lead.contactMethods.find((method) => method.type === 'email' && method.isPrimary)
          ?? lead.contactMethods.find((method) => method.type === 'email');
        const phone = lead.contactMethods.find((method) => method.type === 'whatsapp' && method.isPrimary)
          ?? lead.contactMethods.find((method) => method.type === 'telegram' && method.isPrimary)
          ?? lead.contactMethods.find((method) => ['whatsapp', 'telegram'].includes(method.type));
        return {
          id: lead.id,
          leadId: lead.id,
          sourceService: lead.sourceService,
          email: email?.value ?? null,
          phone: phone?.value ?? null,
          contactMethods: lead.contactMethods,
          preferredChannel: lead.preferredChannel,
          fallbackChannels: Array.isArray(lead.fallbackChannels) ? lead.fallbackChannels : [],
          marketingConsent: lead.marketingConsent,
          consentSource: lead.consentSource,
          consentCapturedAt: lead.consentCapturedAt?.toISOString() ?? null,
          unsubscribedAt: lead.unsubscribedAt?.toISOString() ?? null,
          confirmedAt: lead.confirmedAt?.toISOString() ?? null,
          createdAt: lead.createdAt.toISOString(),
          updatedAt: lead.updatedAt.toISOString(),
        };
      }),
    };
  }

  async listLeads(query: LeadQueryDto) {
    const limit = Math.min(query.limit || 30, 30);
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.sourceService) {
      where.sourceService = query.sourceService;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(query.endDate);
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        include: { contactMethods: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      total,
    };
  }

  async getSanitizedLeadContext(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        status: true,
        sourceService: true,
        sourceUrl: true,
        sourceLabel: true,
        message: true,
        preferredChannel: true,
        fallbackChannels: true,
        marketingConsent: true,
        consentSource: true,
        consentCapturedAt: true,
        confirmedAt: true,
        unsubscribedAt: true,
        confirmationToken: true,
        contactMethods: { select: { type: true, value: true } },
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { payloadJson: true },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return {
      contractVersion: '2026-06-13.ai-crm-context.v1',
      context: buildSanitizedAiCrmLeadContext({
        id: lead.id,
        status: lead.status,
        sourceService: lead.sourceService,
        sourceUrl: lead.sourceUrl,
        sourceLabel: lead.sourceLabel,
        message: lead.message,
        contactMethods: lead.contactMethods,
        metadata: metadataFromSubmissionPayload(lead.submissions[0]?.payloadJson),
        preferredChannel: lead.preferredChannel,
        fallbackChannels: Array.isArray(lead.fallbackChannels) ? lead.fallbackChannels : null,
        marketingConsent: lead.marketingConsent,
        consentSource: lead.consentSource,
        consentCapturedAt: lead.consentCapturedAt,
        confirmedAt: lead.confirmedAt,
        unsubscribedAt: lead.unsubscribedAt,
        confirmationToken: lead.confirmationToken,
      }),
    };
  }

  async previewCampaignEligibility(payload: CampaignEligibilityPreviewDto) {
    const uniqueLeadIds = Array.from(new Set(payload.leadIds));
    const leads = await this.prisma.lead.findMany({
      where: { id: { in: uniqueLeadIds } },
      select: {
        id: true,
        preferredChannel: true,
        fallbackChannels: true,
        marketingConsent: true,
        consentSource: true,
        consentCapturedAt: true,
        unsubscribedAt: true,
        confirmedAt: true,
        contactMethods: {
          select: { type: true },
        },
      },
    });
    const leadsById = new Map(leads.map((lead) => [lead.id, lead]));

    const items = payload.leadIds.map((leadId) => {
      const lead = leadsById.get(leadId);
      if (!lead) {
        return {
          leadId,
          eligible: false,
          reasons: ['invalid_lead_id'],
          contactMethodTypes: [],
          preferredChannel: null,
          fallbackChannelCount: 0,
          marketingConsent: null,
          consentEvidencePresent: false,
          unsubscribed: false,
          confirmed: false,
        };
      }

      const contactMethodTypes = Array.from(
        new Set(
          lead.contactMethods
            .map((method) => method.type)
            .filter((type): type is 'email' | 'telegram' | 'whatsapp' =>
              ['email', 'telegram', 'whatsapp'].includes(String(type)),
            ),
        ),
      ).sort();
      const reasons: string[] = [];
      const consentSourcePresent = Boolean(lead.consentSource);
      const consentCapturedAtPresent = Boolean(lead.consentCapturedAt);
      const consentEvidencePresent = consentSourcePresent && consentCapturedAtPresent;
      const unsubscribed = Boolean(lead.unsubscribedAt);
      const confirmed = Boolean(lead.confirmedAt);
      const supportedChannelPresent = contactMethodTypes.includes(payload.channel);

      if (payload.campaignPurpose === 'marketing') {
        if (lead.marketingConsent === true) {
          reasons.push('marketing_consent_true');
        } else {
          reasons.push('missing_marketing_consent');
        }
        if (consentSourcePresent) {
          reasons.push('consent_source_present');
        } else {
          reasons.push('missing_consent_source');
        }
        if (consentCapturedAtPresent) {
          reasons.push('consent_captured_at_present');
        } else {
          reasons.push('missing_consent_captured_at');
        }
      }

      if (unsubscribed) {
        reasons.push('unsubscribed');
      } else {
        reasons.push('not_unsubscribed');
      }

      if (payload.requireConfirmedContact) {
        if (confirmed) {
          reasons.push('confirmed_when_required');
        } else {
          reasons.push('confirmation_required');
        }
      }

      if (supportedChannelPresent) {
        reasons.push('supported_channel_present');
      } else {
        reasons.push('unsupported_channel');
      }

      const eligible =
        (payload.campaignPurpose !== 'marketing' ||
          (lead.marketingConsent === true && consentEvidencePresent)) &&
        !unsubscribed &&
        (!payload.requireConfirmedContact || confirmed) &&
        supportedChannelPresent;

      return {
        leadId,
        eligible,
        reasons,
        contactMethodTypes,
        preferredChannel: lead.preferredChannel,
        fallbackChannelCount: Array.isArray(lead.fallbackChannels) ? lead.fallbackChannels.length : 0,
        marketingConsent: lead.marketingConsent,
        consentEvidencePresent,
        unsubscribed,
        confirmed,
      };
    });

    const eligibleCount = items.filter((item) => item.eligible).length;

    return {
      contractVersion: '2026-06-13.lifecycle.v1',
      campaignPurpose: payload.campaignPurpose,
      channel: payload.channel,
      requireConfirmedContact: payload.requireConfirmedContact ?? false,
      items,
      summary: {
        requested: payload.leadIds.length,
        eligible: eligibleCount,
        ineligible: payload.leadIds.length - eligibleCount,
      },
    };
  }

  async resolveLeadContact(payload: ContactResolutionDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: payload.leadId },
      select: {
        id: true,
        marketingConsent: true,
        consentSource: true,
        consentCapturedAt: true,
        unsubscribedAt: true,
        confirmedAt: true,
        contactMethods: {
          select: { type: true, value: true, isPrimary: true },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const requestedChannels =
      payload.requestedChannels && payload.requestedChannels.length > 0
        ? Array.from(new Set(payload.requestedChannels))
        : Array.from(new Set(lead.contactMethods.map((method) => method.type)));

    const approvalEvidence =
      payload.purpose === 'approved_campaign_send'
        ? buildMarketingApprovalEvidenceSummary(payload.approvalEvidence ?? {})
        : undefined;

    if (payload.purpose === 'approved_campaign_send') {
      const approvalEvidenceErrors = validateMarketingApprovalEvidenceForContactResolution(
        payload.approvalEvidence,
        requestedChannels,
      );
      if (approvalEvidenceErrors.length > 0) {
        throw new ForbiddenException(`Campaign approval evidence rejected: ${approvalEvidenceErrors.join(';')}`);
      }

      const eligibility = await this.previewCampaignEligibility({
        leadIds: [payload.leadId],
        campaignPurpose: payload.campaignPurpose ?? 'marketing',
        channel: requestedChannels[0] as 'email' | 'telegram' | 'whatsapp',
        requireConfirmedContact: payload.requireConfirmedContact,
      });
      const item = eligibility.items[0];
      if (!item?.eligible) {
        const storageRecord = buildMarketingApprovalEvidenceStorageRecord(
          lead.id,
          payload.approvalEvidence ?? {},
          item ?? { eligible: false, reasons: ['invalid_lead_id'] },
          0,
        );
        await this.prisma.leadMarketingApprovalEvidence.upsert({
          where: { idempotencyKey: storageRecord.idempotencyKey },
          update: {
            eligibilityEligible: storageRecord.eligibilityEligible,
            eligibilityReasons: storageRecord.eligibilityReasons,
            returnedContactMethodCount: storageRecord.returnedContactMethodCount,
          },
          create: storageRecord,
        });
        return {
          leadId: lead.id,
          purpose: payload.purpose,
          resolvedAt: new Date().toISOString(),
          contactMethods: [],
          consent: {
            marketingConsent: lead.marketingConsent,
            consentCapturedAtPresent: Boolean(lead.consentCapturedAt),
            unsubscribed: Boolean(lead.unsubscribedAt),
          },
          approvalEvidence,
          eligibility: item ?? {
            leadId: payload.leadId,
            eligible: false,
            reasons: ['invalid_lead_id'],
          },
        };
      }
    }

    const contactMethods = lead.contactMethods
      .filter((method) => requestedChannels.includes(method.type))
      .map((method) => ({
        type: method.type,
        value: method.value,
        isPrimary: method.isPrimary,
      }));

    if (payload.purpose === 'approved_campaign_send') {
      const storageRecord = buildMarketingApprovalEvidenceStorageRecord(
        lead.id,
        payload.approvalEvidence ?? {},
        { eligible: true, reasons: ['eligible_contact_resolution'] },
        contactMethods.length,
      );
      await this.prisma.leadMarketingApprovalEvidence.upsert({
        where: { idempotencyKey: storageRecord.idempotencyKey },
        update: {
          eligibilityEligible: storageRecord.eligibilityEligible,
          eligibilityReasons: storageRecord.eligibilityReasons,
          returnedContactMethodCount: storageRecord.returnedContactMethodCount,
        },
        create: storageRecord,
      });
    }

    return {
      leadId: lead.id,
      purpose: payload.purpose,
      resolvedAt: new Date().toISOString(),
      contactMethods,
      consent: {
        marketingConsent: lead.marketingConsent,
        consentCapturedAtPresent: Boolean(lead.consentCapturedAt),
        unsubscribed: Boolean(lead.unsubscribedAt),
      },
      ...(approvalEvidence ? { approvalEvidence } : {}),
    };
  }

  async getLeadLifecycleEvents(leadId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const events = await this.prisma.leadLifecycleEvent.findMany({
      where: { leadId },
      orderBy: [{ occurredAt: 'asc' }, { recordedAt: 'asc' }],
      select: {
        eventId: true,
        eventType: true,
        eventVersion: true,
        occurredAt: true,
        producer: true,
        leadId: true,
        correlationId: true,
        idempotencyKey: true,
        dataClass: true,
        payload: true,
        consumerRoutes: true,
        recordedAt: true,
      },
    });

    return {
      leadId,
      contractVersion: '2026-06-13.lifecycle.v1',
      events: events.map((event) => ({
        ...event,
        occurredAt: event.occurredAt.toISOString(),
        recordedAt: event.recordedAt.toISOString(),
      })),
    };
  }


  async getLeadLifecycleReplay(leadId: string, query: LifecycleReplayQuery) {
    const consumer = String(query.consumer ?? "").trim();
    if (consumer !== FLIPFLOP_REPLAY_CONSUMER) {
      throw new ForbiddenException("Lifecycle replay consumer is not approved");
    }

    const purpose = (query.purpose ?? "consumer_reconciliation") as LifecycleReplayPurpose;
    if (!lifecycleReplayPurposes.has(purpose)) {
      throw new BadRequestException("Lifecycle replay purpose is not supported");
    }

    const fromOccurredAt = parseOptionalReplayDate(query.fromOccurredAt, "fromOccurredAt");
    const toOccurredAt = parseOptionalReplayDate(query.toOccurredAt, "toOccurredAt");
    const limit = normalizeLifecycleReplayLimit(parseOptionalReplayLimit(query.limit));

    const lead = await this.prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (!lead) {
      throw new NotFoundException("Lead not found");
    }

    const where: Prisma.LeadLifecycleEventWhereInput = { leadId };
    if (fromOccurredAt || toOccurredAt) {
      const occurredAt: Prisma.DateTimeFilter = {};
      if (fromOccurredAt) {
        occurredAt.gte = fromOccurredAt;
      }
      if (toOccurredAt) {
        occurredAt.lte = toOccurredAt;
      }
      where.occurredAt = occurredAt;
    }

    const events = await this.prisma.leadLifecycleEvent.findMany({
      where,
      orderBy: [{ occurredAt: "asc" }, { eventId: "asc" }],
      take: limit + 1,
      select: {
        eventId: true,
        eventType: true,
        eventVersion: true,
        occurredAt: true,
        producer: true,
        leadId: true,
        correlationId: true,
        idempotencyKey: true,
        dataClass: true,
        payload: true,
        consumerRoutes: true,
        recordedAt: true,
      },
    });

    const replayRecords = events.map((event) => ({
      ...event,
      consumerRoutes: Array.isArray(event.consumerRoutes)
        ? event.consumerRoutes.filter((route): route is string => typeof route === "string")
        : [],
    }));

    return buildLifecycleReplayResponse(
      {
        leadId,
        consumer: FLIPFLOP_REPLAY_CONSUMER,
        purpose,
        requestedAt: new Date(),
        limit,
        fromOccurredAt,
        toOccurredAt,
      },
      replayRecords,
    );
  }

  async getLeadPreferences(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        preferredChannel: true,
        fallbackChannels: true,
        marketingConsent: true,
        consentSource: true,
        consentCapturedAt: true,
        unsubscribedAt: true,
        updatedAt: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async updateLeadPreferences(leadId: string, payload: UpdateLeadPreferencesDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    const data: Prisma.LeadUpdateInput = {};
    if (Object.prototype.hasOwnProperty.call(payload, 'preferredChannel')) {
      data.preferredChannel = payload.preferredChannel;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'fallbackChannels')) {
      data.fallbackChannels = (payload.fallbackChannels ?? null) as Prisma.InputJsonValue | null;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'marketingConsent')) {
      data.marketingConsent = payload.marketingConsent;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'consentSource')) {
      data.consentSource = payload.consentSource;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'consentCapturedAt')) {
      data.consentCapturedAt = payload.consentCapturedAt ? new Date(payload.consentCapturedAt) : null;
    }
    if (Object.prototype.hasOwnProperty.call(payload, 'unsubscribedAt')) {
      data.unsubscribedAt = payload.unsubscribedAt ? new Date(payload.unsubscribedAt) : null;
    }

    return this.prisma.lead.update({
      where: { id: leadId },
      data,
      select: {
        id: true,
        preferredChannel: true,
        fallbackChannels: true,
        marketingConsent: true,
        consentSource: true,
        consentCapturedAt: true,
        unsubscribedAt: true,
        updatedAt: true,
      },
    });
  }

  async confirmLead(token: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { confirmationToken: token },
      select: { id: true, confirmedAt: true, sourceService: true, sourceUrl: true, contactMethods: true },
    });

    if (!lead) {
      throw new NotFoundException('Invalid confirmation token');
    }

    if (!lead.confirmedAt) {
      await this.prisma.lead.update({
        where: { id: lead.id },
        data: { confirmedAt: new Date(), status: 'confirmed' },
      });
    }

    const emailContact = lead.contactMethods.find((m) => m.type === 'email');

    return {
      id: lead.id,
      sourceService: lead.sourceService,
      sourceUrl: lead.sourceUrl,
      email: emailContact?.value ?? null,
    };
  }

  async getLeadConversionSource(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, sourceService: true },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async unsubscribeLead(leadId: string) {
    const existing = await this.prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException('Lead not found');
    }

    return this.prisma.lead.update({
      where: { id: leadId },
      data: {
        marketingConsent: false,
        unsubscribedAt: new Date(),
      },
      select: {
        id: true,
        unsubscribedAt: true,
        updatedAt: true,
      },
    });
  }
}
