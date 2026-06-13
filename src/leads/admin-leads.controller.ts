import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { LoggingService } from '../logging/logging.service';
import { LeadQueryDto } from './dto/lead-query.dto';
import { LeadsService } from './leads.service';

@Controller('admin/leads')
@UseGuards(AdminAuthGuard)
export class AdminLeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly loggingService: LoggingService,
  ) {}

  @Get('summary')
  async getSummary() {
    const result = await this.leadsService.getAdminLeadSummary();
    await this.loggingService.log('info', 'Admin lead summary retrieved', {
      total: result.total,
      confirmed: result.confirmed,
      consented: result.consented,
      unsubscribed: result.unsubscribed,
    });
    return result;
  }

  @Get()
  async listLeads(@Query() query: LeadQueryDto) {
    const result = await this.leadsService.listAdminLeads(query);
    await this.loggingService.log('info', 'Admin lead list retrieved', {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
    return result;
  }

  @Get(':id')
  async getLead(@Param('id') id: string) {
    const result = await this.leadsService.getAdminLeadById(id);
    await this.loggingService.log('info', 'Admin lead detail retrieved', { leadId: id });
    return result;
  }
}
