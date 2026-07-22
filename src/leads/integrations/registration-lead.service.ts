import { Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from '../../logging/logging.service';
import {
  buildLeadCreatedEnvelope,
  leadInputFromRegistration,
  parseRegistrationEvent,
} from './registration-lead';

export const LEADS_GROWTH_EVENTS_EXCHANGE = 'leads.events';

export type PublishEvent = (exchange: string, routingKey: string, envelope: unknown) => Promise<void>;

export type RegistrationLeadResult =
  | { status: 'created'; leadId: string }
  | { status: 'duplicate'; leadId: string }
  | { status: 'ignored'; reason: string };

/**
 * Creates a lead from an `auth.user.registered.v1` and announces it (EP-005 W5, C-005 §2.3).
 *
 * The lead is what later carries the qualification the owner marks by hand (D19); the event is
 * what lets growth-core tie that lead back to the click that produced it.
 */
@Injectable()
export class RegistrationLeadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logging: LoggingService,
    @Optional() private readonly publish?: PublishEvent,
  ) {}

  async handle(event: unknown): Promise<RegistrationLeadResult> {
    const registration = parseRegistrationEvent(event);
    if (!registration) {
      // Not ours, or unusable. Ignored rather than failed: a queue shared with other event types,
      // or one malformed message, must not stall everything behind it.
      return { status: 'ignored', reason: 'not_a_usable_registration' };
    }

    // A person registers once. The unique constraint on authUserId is what actually enforces
    // that; this read only lets a redelivery answer quickly instead of provoking an error.
    const existing = await this.prisma.lead.findUnique({
      where: { authUserId: registration.userId },
      select: { id: true },
    });
    if (existing) {
      return { status: 'duplicate', leadId: existing.id };
    }

    const input = leadInputFromRegistration(registration);

    let leadId: string;
    try {
      const lead = await this.prisma.lead.create({
        data: {
          status: 'new',
          authUserId: input.authUserId,
          sourceService: input.sourceService,
          sourceLabel: input.sourceLabel ?? null,
          message: input.message,
          marketingConsent: null,
          contactMethods: { create: input.contactMethods },
        },
        select: { id: true },
      });
      leadId = lead.id;
    } catch (error) {
      // Two deliveries racing: both passed the read above, one lost the insert. That is the
      // constraint doing its job, not a failure — the lead exists either way.
      if (isUniqueViolation(error)) {
        const winner = await this.prisma.lead.findUnique({
          where: { authUserId: registration.userId },
          select: { id: true },
        });
        if (winner) return { status: 'duplicate', leadId: winner.id };
      }
      throw error;
    }

    await this.announce(leadId, registration.userId, registration.correlationId);

    return { status: 'created', leadId };
  }

  private async announce(leadId: string, userId: string, correlationId?: string): Promise<void> {
    if (!this.publish) return;

    const envelope = buildLeadCreatedEnvelope({
      leadId,
      userId,
      correlationId,
      workspaceId: process.env.LEADS_GROWTH_WORKSPACE_ID?.trim() || 'bazos',
      now: new Date(),
      eventId: randomUUID(),
    });

    try {
      await this.publish(LEADS_GROWTH_EVENTS_EXCHANGE, envelope.eventType, envelope);
    } catch (error) {
      // The lead is already stored, which is the part that must not be lost. A failed
      // announcement is logged with enough to replay it rather than rolled back — deleting a real
      // lead because a broker was down would be the worse trade.
      await this.logging.log('error', 'Lead created from registration but not announced', {
        registrationLead: {
          leadId,
          userId,
          eventType: envelope.eventType,
          errorName: error instanceof Error ? error.name : 'unknown',
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (error as { code?: string })?.code === 'P2002';
}
