import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

type ContactMethod = {
  type: string;
  value: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly httpService: HttpService) {}

  async sendLeadConfirmation(contactMethods: ContactMethod[], leadId: string): Promise<boolean> {
    const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
    if (!baseUrl || contactMethods.length === 0) {
      return false;
    }

    const channelMap: Record<string, string> = {
      email: 'email',
      telegram: 'telegram',
      whatsapp: 'whatsapp',
    };

    const selected = contactMethods.find((method) => channelMap[method.type]);
    if (!selected) {
      return false;
    }

    const url = `${baseUrl}/notifications/send`;
    const payload = {
      channel: channelMap[selected.type],
      type: 'custom',
      recipient: selected.value,
      subject: selected.type === 'email' ? 'We received your request' : undefined,
      message: `Your request was received. Lead ID: ${leadId}`,
    };

    try {
      await lastValueFrom(this.httpService.post(url, payload));
      return true;
    } catch {
      return false;
    }
  }
}
