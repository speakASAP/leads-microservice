import { Body, Controller, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { UpdateLeadPreferencesDto } from './dto/update-lead-preferences.dto';
import { LoggingService } from '../logging/logging.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InternalServiceGuard } from './guards/internal-service.guard';

@Controller('leads')
export class LeadsController {
  private readonly logger = new Logger(LeadsController.name);

  constructor(
    private readonly leadsService: LeadsService,
    private readonly loggingService: LoggingService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('submit')
  async submitLead(@Body() payload: CreateLeadDto) {
    this.logger.log(`submitLead START sourceService=${payload.sourceService} contactMethods=${JSON.stringify(payload.contactMethods)} messageLen=${payload.message?.length} metadata=${JSON.stringify(payload.metadata)}`);

    const lead = await this.leadsService.createLead(payload);
    this.logger.log(`submitLead lead created leadId=${lead.id}`);
    await this.loggingService.log('info', 'Lead submitted', { leadId: lead.id, sourceService: lead.sourceService });

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
    return this.leadsService.confirmLead(token);
  }

  @Get(':id')
  async getLead(@Param('id') id: string) {
    const lead = await this.leadsService.getLeadById(id);
    await this.loggingService.log('info', 'Lead retrieved', { leadId: id });
    return lead;
  }

  @Get()
  async listLeads(@Query() query: LeadQueryDto) {
    const result = await this.leadsService.listLeads(query);
    await this.loggingService.log('info', 'Lead list retrieved', {
      sourceService: query.sourceService || null,
      page: result.page,
      limit: result.limit,
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
    return result;
  }
}
