import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AdminAuthUser } from '../auth/admin-auth.guard';
import { LoggingService } from '../logging/logging.service';
import { LeadQueryDto } from './dto/lead-query.dto';
import { LeadsService } from './leads.service';
import { QualificationService } from './integrations/qualification.service';

@Controller('admin/leads')
@UseGuards(AdminAuthGuard)
export class AdminLeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly loggingService: LoggingService,
    private readonly qualificationService: QualificationService,
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

  /**
   * S6 — the manual marking surface (C-006 §1).
   *
   * The whole of "how the owner qualifies a lead" is this endpoint plus two buttons in the panel
   * that already lists leads. It is a POST and not a PATCH on purpose: this appends a judgement,
   * it does not edit one. A correction posts again with `supersedesQualificationId`, and both
   * judgements stay readable afterwards.
   */
  @Post(':id/qualification')
  async recordQualification(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() request: { adminUser: AdminAuthUser },
  ) {
    const result = await this.qualificationService.record(id, body, request.adminUser);

    if (result.status === 'invalid') {
      throw new BadRequestException(
        'qualificationStatus must be "qualified" or "disqualified", and reason must not be blank',
      );
    }
    // Indistinguishable from "the lead exists but is outside your workspace", deliberately: an
    // operator learning which lead ids exist elsewhere is the leak this endpoint would otherwise be.
    if (result.status === 'lead_not_found') {
      throw new NotFoundException('Lead not found');
    }

    await this.loggingService.log('info', 'Lead qualification recorded', {
      leadQualification: {
        leadId: id,
        qualificationId: result.qualificationId,
        // No reason text here: it is free text about a person, and it belongs in the row, not in
        // every log sink downstream.
        decidedById: request.adminUser.id,
        announced: result.announced,
      },
    });

    return { qualificationId: result.qualificationId, announced: result.announced };
  }

  @Get(':id/qualification')
  async getQualificationHistory(@Param('id') id: string, @Req() request: { adminUser: AdminAuthUser }) {
    return { items: await this.qualificationService.history(id, request.adminUser) };
  }
}
