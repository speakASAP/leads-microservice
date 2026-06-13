import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignEligibilityPreviewDto } from './dto/campaign-eligibility-preview.dto';
import { ContactResolutionDto } from './dto/contact-resolution.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadPreferencesDto } from './dto/update-lead-preferences.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

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
    if (payload.purpose === 'approved_campaign_send' && !payload.approvalId) {
      throw new NotFoundException('Campaign approval evidence is required');
    }

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

    if (payload.purpose === 'approved_campaign_send') {
      const eligibility = await this.previewCampaignEligibility({
        leadIds: [payload.leadId],
        campaignPurpose: payload.campaignPurpose ?? 'marketing',
        channel: requestedChannels[0] as 'email' | 'telegram' | 'whatsapp',
        requireConfirmedContact: payload.requireConfirmedContact,
      });
      const item = eligibility.items[0];
      if (!item?.eligible) {
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
