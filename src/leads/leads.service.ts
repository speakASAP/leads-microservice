import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
