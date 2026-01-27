import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [LeadsModule],
  controllers: [HealthController],
})
export class AppModule {}
