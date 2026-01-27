import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LoggingService {
  constructor(private readonly httpService: HttpService) {}

  async log(level: string, message: string, meta: Record<string, unknown> = {}) {
    const baseUrl = process.env.LOGGING_SERVICE_URL;
    if (!baseUrl) {
      return;
    }

    const path = process.env.LOGGING_SERVICE_API_PATH || '/api/logs';
    const url = `${baseUrl}${path}`;
    const payload = {
      service: process.env.SERVICE_NAME || 'leads-microservice',
      level,
      message,
      meta,
      timestamp: new Date().toISOString(),
    };

    try {
      await lastValueFrom(this.httpService.post(url, payload));
    } catch {
      // Ignore logging errors to keep intake responsive
    }
  }
}
