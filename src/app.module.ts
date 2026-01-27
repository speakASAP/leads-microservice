import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health/health.controller';
import { LeadsModule } from './leads/leads.module';
import { PrismaService } from './prisma/prisma.service';
import { LoggingService } from './logging/logging.service';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [HttpModule, LeadsModule],
  controllers: [HealthController],
  providers: [PrismaService, LoggingService, NotificationsService],
})
export class AppModule {}
