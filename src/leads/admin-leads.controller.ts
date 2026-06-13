import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AdminAuthGuard, AdminAuthUser } from '../auth/admin-auth.guard';
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
  async getSummary(@Req() request: { adminUser: AdminAuthUser }) {
    const result = await this.leadsService.getAdminLeadSummary(request.adminUser);
    await this.loggingService.log('info', 'Admin lead summary retrieved', {
      total: result.total,
      confirmed: result.confirmed,
      consented: result.consented,
      unsubscribed: result.unsubscribed,
      workspaceId: request.adminUser.workspaceId ?? null,
      globalAdmin: request.adminUser.isGlobalAdmin,
    });
    return result;
  }

  @Get()
  async listLeads(@Query() query: LeadQueryDto, @Req() request: { adminUser: AdminAuthUser }) {
    const result = await this.leadsService.listAdminLeads(query, request.adminUser);
    await this.loggingService.log('info', 'Admin lead list retrieved', {
      page: result.page,
      limit: result.limit,
      total: result.total,
      workspaceId: request.adminUser.workspaceId ?? null,
      globalAdmin: request.adminUser.isGlobalAdmin,
    });
    return result;
  }

  @Get(':id')
  async getLead(@Param('id') id: string, @Req() request: { adminUser: AdminAuthUser }) {
    const result = await this.leadsService.getAdminLeadById(id, request.adminUser);
    await this.loggingService.log('info', 'Admin lead detail retrieved', {
      leadId: id,
      workspaceId: request.adminUser.workspaceId ?? null,
      globalAdmin: request.adminUser.isGlobalAdmin,
    });
    return result;
  }
}
