import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InternalServiceGuard } from './guards/internal-service.guard';
import { LeadLifecycleEventRouterService } from './integrations/lifecycle-event-router.service';

@Module({
  imports: [HttpModule],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    PrismaService,
    LoggingService,
    LeadLifecycleEventRouterService,
    NotificationsService,
    InternalServiceGuard,
  ],
})
export class LeadsModule {}
