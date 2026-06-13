import { randomUUID } from 'crypto';
import { Body, Controller, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CampaignEligibilityPreviewDto } from './dto/campaign-eligibility-preview.dto';
import { ContactResolutionDto } from './dto/contact-resolution.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { LinkLeadToUserDto } from './dto/link-lead-to-user.dto';
import { UpdateLeadPreferencesDto } from './dto/update-lead-preferences.dto';
import { LoggingService } from '../logging/logging.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InternalServiceGuard } from './guards/internal-service.guard';
import {
  buildLeadConfirmedEvent,
  buildLeadConvertedToUserEvent,
  buildLeadPreferenceUpdatedEvent,
  buildLeadSubmittedEvent,
} from './integrations/lifecycle-events';
import { LeadLifecycleEventRouterService } from './integrations/lifecycle-event-router.service';

@Controller('leads')
export class LeadsController {
  private readonly logger = new Logger(LeadsController.name);

  constructor(
    private readonly leadsService: LeadsService,
    private readonly loggingService: LoggingService,
    private readonly lifecycleEventRouter: LeadLifecycleEventRouterService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('submit')
  async submitLead(@Body() payload: CreateLeadDto) {
    const contactMethodTypes = payload.contactMethods.map((method) => method.type).filter(Boolean).join(',') || 'none';
    const metadataKeys = payload.metadata ? Object.keys(payload.metadata).join(',') : 'none';
    this.logger.log(
      `submitLead START sourceService=${payload.sourceService}` +
        ` contactMethodCount=${payload.contactMethods.length}` +
        ` contactMethodTypes=${contactMethodTypes}` +
        ` messageLen=${payload.message?.length}` +
        ` metadataKeys=${metadataKeys}`,
    );

    const lead = await this.leadsService.createLead(payload);
    this.logger.log(`submitLead lead created leadId=${lead.id}`);
    await this.loggingService.log('info', 'Lead submitted', { leadId: lead.id, sourceService: lead.sourceService });

    const leadSubmittedEvent = buildLeadSubmittedEvent(
      {
        id: lead.id,
        status: lead.status,
        sourceService: lead.sourceService,
        sourceUrl: lead.sourceUrl,
        sourceLabel: lead.sourceLabel,
        contactMethods: lead.contactMethods,
        preferredChannel: lead.preferredChannel,
        fallbackChannels: Array.isArray(lead.fallbackChannels) ? lead.fallbackChannels : null,
        marketingConsent: lead.marketingConsent,
        consentSource: lead.consentSource,
        consentCapturedAt: lead.consentCapturedAt,
        confirmedAt: lead.confirmedAt,
        unsubscribedAt: lead.unsubscribedAt,
        createdAt: lead.createdAt,
      },
      {
        eventId: randomUUID(),
        occurredAt: new Date(),
        correlationId: lead.id,
        idempotencyKey: `lead-submitted:${lead.id}`,
      },
    );
    await this.lifecycleEventRouter.route(leadSubmittedEvent);

    const confirmationSent = await this.notificationsService.sendLeadConfirmation(
      payload.contactMethods,
      {
        name: typeof payload.metadata?.name === 'string' ? payload.metadata.name : undefined,
        message: payload.message,
        sourceService: payload.sourceService,
        sourceUrl: payload.sourceUrl,
        confirmationToken: lead.confirmationToken ?? undefined,
      },
    );

    this.logger.log(`submitLead DONE leadId=${lead.id} confirmationSent=${confirmationSent}`);

    return {
      leadId: lead.id,
      status: lead.status,
      confirmationSent,
    };
  }

  @Get('confirm/:token')
  async confirmLead(@Param('token') token: string) {
    const result = await this.leadsService.confirmLead(token);
    const confirmedAt = new Date();
    const leadConfirmedEvent = buildLeadConfirmedEvent(
      {
        id: result.id,
        sourceService: result.sourceService,
        confirmedAt,
      },
      {
        eventId: randomUUID(),
        occurredAt: confirmedAt,
        correlationId: result.id,
        idempotencyKey: `lead-confirmed:${result.id}`,
      },
    );
    await this.lifecycleEventRouter.route(leadConfirmedEvent);
    return result;
  }

  @Get(':id')
  @UseGuards(InternalServiceGuard)
  async getLead(@Param('id') id: string) {
    const lead = await this.leadsService.getLeadById(id);
    await this.loggingService.log('info', 'Lead retrieved', { leadId: id });
    return lead;
  }

  @Get()
  @UseGuards(InternalServiceGuard)
  async listLeads(@Query() query: LeadQueryDto) {
    const result = await this.leadsService.listLeads(query);
    await this.loggingService.log('info', 'Lead list retrieved', {
      sourceService: query.sourceService || null,
      page: result.page,
      limit: result.limit,
    });
    return result;
  }

  @Post('internal/contact-resolution')
  @UseGuards(InternalServiceGuard)
  async resolveLeadContact(@Body() payload: ContactResolutionDto) {
    const startedAt = Date.now();
    const result = await this.leadsService.resolveLeadContact(payload);
    await this.loggingService.log('info', 'Lead contact resolved via internal API', {
      leadId: result.leadId,
      purpose: result.purpose,
      requestedChannelCount: payload.requestedChannels?.length ?? null,
      returnedContactMethodCount: result.contactMethods.length,
      approvalEvidencePresent: Boolean(payload.approvalId),
      duration_ms: Date.now() - startedAt,
    });
    return result;
  }

  @Post('internal/campaign-eligibility/preview')
  @UseGuards(InternalServiceGuard)
  async previewCampaignEligibility(@Body() payload: CampaignEligibilityPreviewDto) {
    const startedAt = Date.now();
    const result = await this.leadsService.previewCampaignEligibility(payload);
    await this.loggingService.log('info', 'Lead campaign eligibility previewed', {
      campaignPurpose: result.campaignPurpose,
      channel: result.channel,
      requireConfirmedContact: result.requireConfirmedContact,
      requested: result.summary.requested,
      eligible: result.summary.eligible,
      ineligible: result.summary.ineligible,
      duration_ms: Date.now() - startedAt,
    });
    return result;
  }

  @Get('internal/:id/preferences')
  @UseGuards(InternalServiceGuard)
  async getLeadPreferences(@Param('id') id: string) {
    const startedAt = Date.now();
    const result = await this.leadsService.getLeadPreferences(id);
    await this.loggingService.log('info', 'Lead preferences retrieved', {
      leadId: id,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
    });
    return result;
  }

  @Patch('internal/:id/preferences')
  @UseGuards(InternalServiceGuard)
  async updateLeadPreferences(@Param('id') id: string, @Body() payload: UpdateLeadPreferencesDto) {
    const startedAt = Date.now();
    const result = await this.leadsService.updateLeadPreferences(id, payload);
    await this.loggingService.log('info', 'Lead preferences updated', {
      leadId: id,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
    });
    const occurredAt = result.updatedAt ?? new Date();
    const leadPreferenceUpdatedEvent = buildLeadPreferenceUpdatedEvent(
      {
        id: result.id,
        sourceService: 'leads-microservice',
        preferredChannel: result.preferredChannel,
        fallbackChannels: Array.isArray(result.fallbackChannels) ? result.fallbackChannels : null,
        marketingConsent: result.marketingConsent,
        consentSource: result.consentSource,
        consentCapturedAt: result.consentCapturedAt,
        unsubscribedAt: result.unsubscribedAt,
        updatedAt: result.updatedAt,
      },
      {
        eventId: randomUUID(),
        occurredAt,
        correlationId: result.id,
        idempotencyKey: `lead-preference-updated:${result.id}:${new Date(occurredAt).getTime()}`,
      },
    );
    await this.lifecycleEventRouter.route(leadPreferenceUpdatedEvent);
    return result;
  }

  @Post('internal/:id/unsubscribe')
  @UseGuards(InternalServiceGuard)
  async unsubscribeLead(@Param('id') id: string) {
    const startedAt = Date.now();
    const result = await this.leadsService.unsubscribeLead(id);
    await this.loggingService.log('info', 'Lead unsubscribed via internal API', {
      leadId: id,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
    });
    const occurredAt = result.updatedAt ?? result.unsubscribedAt ?? new Date();
    const leadPreferenceUpdatedEvent = buildLeadPreferenceUpdatedEvent(
      {
        id: result.id,
        sourceService: 'leads-microservice',
        marketingConsent: false,
        unsubscribedAt: result.unsubscribedAt,
        updatedAt: result.updatedAt,
      },
      {
        eventId: randomUUID(),
        occurredAt,
        correlationId: result.id,
        idempotencyKey: `lead-preference-updated:${result.id}:${new Date(occurredAt).getTime()}`,
      },
    );
    await this.lifecycleEventRouter.route(leadPreferenceUpdatedEvent);
    return result;
  }

  @Post('internal/:id/conversion-links')
  @UseGuards(InternalServiceGuard)
  async linkLeadToUser(@Param('id') id: string, @Body() payload: LinkLeadToUserDto) {
    const lead = await this.leadsService.getLeadConversionSource(id);
    const linkedAt = payload.linkedAt ? new Date(payload.linkedAt) : new Date();
    const leadConvertedToUserEvent = buildLeadConvertedToUserEvent(
      {
        leadId: lead.id,
        userId: payload.userId,
        sourceService: lead.sourceService,
        linkMethod: payload.linkMethod,
        linkedAt,
      },
      {
        eventId: randomUUID(),
        occurredAt: linkedAt,
        correlationId: lead.id,
        idempotencyKey: `lead-converted-to-user:${lead.id}:${payload.userId}:${payload.linkMethod}:${linkedAt.getTime()}`,
      },
    );
    const routing = await this.lifecycleEventRouter.route(leadConvertedToUserEvent);

    return {
      leadId: lead.id,
      userId: payload.userId,
      linkMethod: payload.linkMethod,
      linkedAt: linkedAt.toISOString(),
      lifecycleEventId: leadConvertedToUserEvent.eventId,
      consumerRoutes: routing.consumerRoutes,
    };
  }
}
