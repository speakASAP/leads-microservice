import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { LoggingService } from '../logging/logging.service';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly loggingService: LoggingService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('submit')
  async submitLead(@Body() payload: CreateLeadDto) {
    const lead = await this.leadsService.createLead(payload);
    await this.loggingService.log('info', 'Lead submitted', { leadId: lead.id, sourceService: lead.sourceService });

    const confirmationSent = await this.notificationsService.sendLeadConfirmation(
      payload.contactMethods,
      lead.id,
    );

    return {
      leadId: lead.id,
      status: lead.status,
      confirmationSent,
    };
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
}
