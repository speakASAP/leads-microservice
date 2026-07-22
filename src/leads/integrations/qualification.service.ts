import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from '../../logging/logging.service';
import { AdminAuthUser } from '../../auth/admin-auth.guard';
import { scopedAdminLeadWhere } from '../leads.service';
import { buildQualificationEnvelope, parseQualificationRequest } from './qualification';

export const LEADS_GROWTH_EVENTS_EXCHANGE = 'leads.events';

export type PublishEvent = (exchange: string, routingKey: string, envelope: unknown) => Promise<void>;

export type QualificationResult =
  | { status: 'recorded'; qualificationId: string; announced: boolean }
  | { status: 'invalid' }
  | { status: 'lead_not_found' };

/**
 * S6 — the manual marking surface behind the CRM (C-006 §1).
 *
 * The owner works a lead on WhatsApp or e-mail, comes back here, and records what he concluded.
 * Nothing in this service decides anything about a lead; it records what a human decided. That is
 * the whole point of `criteriaVersion: v1-owner-manual` — there is no rule, no score and no model
 * anywhere in this path, and the `const`s in the contract schema are what keep it that way.
 */
@Injectable()
export class QualificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logging: LoggingService,
    @Optional() private readonly publish?: PublishEvent,
  ) {}

  async record(
    leadId: string,
    body: unknown,
    adminUser: AdminAuthUser,
  ): Promise<QualificationResult> {
    const parsed = parseQualificationRequest(body);
    if (!parsed) return { status: 'invalid' };

    // Scoped exactly like the admin read path. A judgement writable on a lead the operator cannot
    // see would be an authorisation hole opened from the write side, which is the side nobody
    // thinks to check.
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, ...scopedAdminLeadWhere({}, adminUser) },
      select: { id: true },
    });
    if (!lead) return { status: 'lead_not_found' };

    const now = new Date();
    const row = await this.prisma.leadQualification.create({
      data: {
        leadId,
        qualificationStatus: parsed.qualificationStatus,
        criteriaVersion: 'v1-owner-manual',
        decidedByType: 'human',
        // From the authenticated principal, never from the body.
        decidedById: adminUser.id,
        decidedAt: now,
        reason: parsed.reason,
        supersedesQualificationId: parsed.supersedesQualificationId ?? null,
      },
      select: { id: true },
    });

    const announced = await this.announce({
      qualificationId: row.id,
      leadId,
      qualificationStatus: parsed.qualificationStatus,
      decidedById: adminUser.id,
      reason: parsed.reason,
      supersedesQualificationId: parsed.supersedesQualificationId,
      now,
    });

    return { status: 'recorded', qualificationId: row.id, announced };
  }

  async history(leadId: string, adminUser: AdminAuthUser) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, ...scopedAdminLeadWhere({}, adminUser) },
      select: { id: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    // Newest first, and every judgement kept — including the ones that were superseded. A history
    // that showed only the current verdict would answer "is this lead qualified" and lose "did we
    // change our mind, when, and why", which is the question the correction path exists for.
    return this.prisma.leadQualification.findMany({
      where: { leadId },
      orderBy: { decidedAt: 'desc' },
      select: {
        id: true,
        qualificationStatus: true,
        criteriaVersion: true,
        decidedByType: true,
        decidedById: true,
        decidedAt: true,
        reason: true,
        supersedesQualificationId: true,
        announcedAt: true,
      },
    });
  }

  private async announce(input: {
    qualificationId: string;
    leadId: string;
    qualificationStatus: 'qualified' | 'disqualified';
    decidedById: string;
    reason: string;
    supersedesQualificationId?: string;
    now: Date;
  }): Promise<boolean> {
    if (!this.publish) return false;

    const envelope = buildQualificationEnvelope({
      ...input,
      workspaceId: process.env.LEADS_GROWTH_WORKSPACE_ID?.trim() || 'bazos',
      eventId: randomUUID(),
    });

    try {
      await this.publish(LEADS_GROWTH_EVENTS_EXCHANGE, envelope.eventType, envelope);
    } catch (error) {
      // The judgement is already stored, which is the part that must not be lost — a human looked
      // at a lead and decided something, and that is far scarcer than the message carrying it.
      // Logged with enough to replay, and `announcedAt` left null so the gap is visible in the
      // table rather than only in a log nobody reads.
      await this.logging.log('error', 'Lead qualification recorded but not announced', {
        leadQualification: {
          qualificationId: input.qualificationId,
          leadId: input.leadId,
          eventType: envelope.eventType,
          errorName: error instanceof Error ? error.name : 'unknown',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      return false;
    }

    await this.prisma.leadQualification.update({
      where: { id: input.qualificationId },
      data: { announcedAt: new Date() },
    });
    return true;
  }
}
