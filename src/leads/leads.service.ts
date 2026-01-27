import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';

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
      metadata: payload.metadata ?? null,
    };

    const lead = await this.prisma.lead.create({
      data: {
        status: 'new',
        sourceService: payload.sourceService,
        sourceUrl: payload.sourceUrl,
        sourceLabel: payload.sourceLabel,
        message: payload.message,
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
}
