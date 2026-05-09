import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

type ContactMethod = {
  type: string;
  value: string;
};

type LeadContext = {
  name?: string;
  message: string;
  sourceService: string;
  sourceUrl?: string;
  confirmationToken?: string;
};

const BG_URL = 'https://speakasap.com/static/big_brother/assets/bg.png';

function buildAdminHtml(ctx: LeadContext, contactMethods: ContactMethod[]): string {
  const domain = ctx.sourceUrl
    ? new URL(ctx.sourceUrl).hostname.replace(/^www\./, '')
    : ctx.sourceService;

  const contactRows = contactMethods
    .map((m) => `<tr><td style="padding:4px 8px;color:#555;font-size:14px;">${m.type}</td><td style="padding:4px 8px;font-size:14px;"><strong>${m.value}</strong></td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nový zájem — ${domain}</title>
</head>
<body style="margin:0;padding:0;background:url('${BG_URL}') repeat #BBDEFB;background-color:#BBDEFB;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:url('${BG_URL}') repeat #BBDEFB;background-color:#BBDEFB;"
       bgcolor="#BBDEFB" background="${BG_URL}">
  <tr>
    <td align="center" style="padding:20px 0;background:url('${BG_URL}') repeat #BBDEFB;background-color:#BBDEFB;"
        bgcolor="#BBDEFB" background="${BG_URL}">

      <table cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:640px;border-radius:8px;overflow:hidden;
                    box-shadow:0 2px 2px rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px rgba(0,0,0,.12);">

        <!-- Header -->
        <tr>
          <td style="background-color:#1E88E5;padding:14px 24px;border-radius:8px 8px 0 0;">
            <a href="https://${domain}" style="color:#fff;text-decoration:none;font-size:18px;font-family:Arial,sans-serif;">
              ${domain}
            </a>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background-color:#F5F5F5;padding:32px 24px;font-family:Arial,sans-serif;font-size:15px;color:#333;line-height:1.6;">
            <p style="margin:0 0 4px;font-size:18px;font-weight:bold;color:#1E88E5;">Nový zájem</p>
            ${ctx.name ? `<p style="margin:0 0 12px;font-size:15px;">Jméno: <strong>${ctx.name}</strong></p>` : ''}
            <p style="margin:12px 0 6px;font-size:14px;color:#555;">Kontakt:</p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">${contactRows}</table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="border-left:4px solid #1E88E5;background:#E3F2FD;border-radius:0 4px 4px 0;margin-bottom:20px;">
              <tr><td style="padding:14px 16px;font-size:14px;color:#1a1a1a;line-height:1.6;">
                <strong style="display:block;margin-bottom:6px;color:#1E88E5;">Zpráva:</strong>
                ${ctx.message.replace(/\n/g, '<br>')}
              </td></tr>
            </table>
            <p style="margin:0;font-size:12px;color:#888;">Zdroj: ${ctx.sourceService}${ctx.sourceUrl ? ` · ${ctx.sourceUrl}` : ''}</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1E88E5;padding:16px 24px;border-radius:0 0 8px 8px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#fff;line-height:1.6;">
              <a href="https://${domain}" style="color:#fff;text-decoration:none;">${domain}</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildHtml(ctx: LeadContext): string {
  const greeting = ctx.name ? `Dobrý den, ${ctx.name}!` : 'Dobrý den!';
  const domain = ctx.sourceUrl
    ? new URL(ctx.sourceUrl).hostname.replace(/^www\./, '')
    : ctx.sourceService;
  const baseUrl = ctx.sourceUrl ? `https://${domain}` : `https://${ctx.sourceService}`;
  const confirmUrl = ctx.confirmationToken
    ? `${baseUrl}/confirm?token=${ctx.confirmationToken}`
    : null;

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vaše zpráva byla přijata</title>
</head>
<body style="margin:0;padding:0;background:url('${BG_URL}') repeat #BBDEFB;background-color:#BBDEFB;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:url('${BG_URL}') repeat #BBDEFB;background-color:#BBDEFB;"
       bgcolor="#BBDEFB" background="${BG_URL}">
  <tr>
    <td align="center" style="padding:20px 0;background:url('${BG_URL}') repeat #BBDEFB;background-color:#BBDEFB;"
        bgcolor="#BBDEFB" background="${BG_URL}">

      <table cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:640px;border-radius:8px;overflow:hidden;
                    box-shadow:0 2px 2px rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px rgba(0,0,0,.12);">

        <!-- Header -->
        <tr>
          <td style="background-color:#1E88E5;padding:14px 24px;border-radius:8px 8px 0 0;">
            <a href="https://${domain}" style="color:#fff;text-decoration:none;font-size:18px;font-family:Arial,sans-serif;">
              ${domain}
            </a>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background-color:#F5F5F5;padding:32px 24px;font-family:Arial,sans-serif;font-size:15px;color:#333;line-height:1.6;">
            <p style="margin:0 0 16px;">${greeting}</p>
            <p style="margin:0 0 16px;">
              Děkujeme za váš zájem! Vaše zpráva byla přijata a brzy se vám ozveme.
            </p>

            <!-- Message box -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="margin:20px 0;border-left:4px solid #1E88E5;background:#E3F2FD;border-radius:0 4px 4px 0;">
              <tr>
                <td style="padding:14px 16px;font-size:14px;color:#1a1a1a;line-height:1.6;">
                  <strong style="display:block;margin-bottom:6px;color:#1E88E5;">Vaše zpráva:</strong>
                  ${ctx.message.replace(/\n/g, '<br>')}
                </td>
              </tr>
            </table>

            ${confirmUrl ? `
            <!-- Confirmation button -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;">
              <tr>
                <td align="center">
                  <a href="${confirmUrl}"
                     style="display:inline-block;background-color:#1E88E5;color:#fff;font-family:Arial,sans-serif;
                            font-size:16px;font-weight:bold;text-decoration:none;padding:14px 32px;
                            border-radius:6px;letter-spacing:0.3px;">
                    Potvrdit registraci
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top:10px;font-family:Arial,sans-serif;font-size:12px;color:#888;">
                  Nebo zkopírujte tento odkaz do prohlížeče:<br>
                  <a href="${confirmUrl}" style="color:#1E88E5;word-break:break-all;">${confirmUrl}</a>
                </td>
              </tr>
            </table>
            ` : `
            <p style="margin:0 0 24px;">
              Pokud máte další otázky, neváhejte nás kontaktovat.
            </p>
            `}

            <p style="margin:0;">
              S pozdravem,<br>
              <strong>Tým ${domain}</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1E88E5;padding:16px 24px;border-radius:0 0 8px 8px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#fff;line-height:1.6;">
              <a href="https://${domain}" style="color:#fff;text-decoration:none;">${domain}</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly httpService: HttpService) {}

  private async sendViaNotifications(
    payload: Record<string, unknown>,
    baseUrl: string,
    label: string,
  ): Promise<void> {
    const serviceToken = process.env.NOTIFICATIONS_SERVICE_TOKEN;
    const hasToken = !!serviceToken;
    const url = `${baseUrl}/notifications/send`;

    this.logger.log(`[${label}] POST ${url} channel=${payload['channel']} recipient=${payload['recipient']} hasToken=${hasToken}`);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (serviceToken) {
      headers['Authorization'] = `Bearer ${serviceToken}`;
    }

    try {
      const resp = await lastValueFrom(this.httpService.post(url, payload, { headers }));
      this.logger.log(`[${label}] SUCCESS status=${resp.status} data=${JSON.stringify(resp.data)}`);
    } catch (err) {
      const axiosErr = err as AxiosError;
      const status = axiosErr.response?.status;
      const body = JSON.stringify(axiosErr.response?.data);
      const msg = axiosErr.message;
      this.logger.error(`[${label}] FAILED status=${status} message=${msg} body=${body}`);
      throw err;
    }
  }

  async sendLeadConfirmation(
    contactMethods: ContactMethod[],
    ctx: LeadContext,
  ): Promise<boolean> {
    const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
    const adminEmail = process.env.ADMIN_EMAIL;

    this.logger.log(
      `sendLeadConfirmation START` +
      ` baseUrl=${baseUrl}` +
      ` adminEmail=${adminEmail}` +
      ` contactMethods=${JSON.stringify(contactMethods)}` +
      ` sourceService=${ctx.sourceService}` +
      ` sourceUrl=${ctx.sourceUrl}` +
      ` name=${ctx.name}` +
      ` messageLen=${ctx.message?.length}`
    );

    if (!baseUrl) {
      this.logger.error('sendLeadConfirmation ABORT: NOTIFICATION_SERVICE_URL is not set');
      return false;
    }

    let domain: string;
    try {
      domain = ctx.sourceUrl
        ? new URL(ctx.sourceUrl).hostname.replace(/^www\./, '')
        : ctx.sourceService;
    } catch (e) {
      domain = ctx.sourceService;
      this.logger.warn(`sendLeadConfirmation: failed to parse sourceUrl="${ctx.sourceUrl}", using sourceService as domain`);
    }

    this.logger.log(`sendLeadConfirmation domain=${domain}`);

    // Admin notification
    if (adminEmail) {
      this.logger.log(`sendLeadConfirmation: sending ADMIN notification to ${adminEmail}`);
      try {
        await this.sendViaNotifications({
          channel: 'email',
          type: 'custom',
          recipient: adminEmail,
          subject: `Nový zájem — ${domain}${ctx.name ? ` od ${ctx.name}` : ''}`,
          message: buildAdminHtml(ctx, contactMethods),
          contentType: 'text/html',
          service: ctx.sourceService,
          fromName: domain,
        }, baseUrl, 'ADMIN');
        this.logger.log('sendLeadConfirmation: ADMIN notification sent OK');
      } catch (e) {
        this.logger.error(`sendLeadConfirmation: ADMIN notification failed (non-fatal): ${(e as Error).message}`);
      }
    } else {
      this.logger.warn('sendLeadConfirmation: ADMIN_EMAIL not set, skipping admin notification');
    }

    // Submitter confirmation
    if (contactMethods.length === 0) {
      this.logger.warn('sendLeadConfirmation: no contactMethods, skipping submitter confirmation');
      return false;
    }

    const channelMap: Record<string, string> = {
      email: 'email',
      telegram: 'telegram',
      whatsapp: 'whatsapp',
    };

    const selected = contactMethods.find((method) => channelMap[method.type]);
    if (!selected) {
      this.logger.warn(`sendLeadConfirmation: no supported channel in contactMethods=${JSON.stringify(contactMethods)}`);
      return false;
    }

    this.logger.log(`sendLeadConfirmation: sending SUBMITTER confirmation channel=${selected.type} recipient=${selected.value}`);

    const isEmail = selected.type === 'email';
    const html = isEmail ? buildHtml(ctx) : undefined;
    const fromName = isEmail ? domain : undefined;

    try {
      await this.sendViaNotifications({
        channel: channelMap[selected.type],
        type: 'custom',
        recipient: selected.value,
        subject: isEmail ? `Vaše zpráva byla přijata — ${ctx.sourceService}` : undefined,
        message: isEmail ? html : `Vaše zpráva byla přijata. Brzy se vám ozveme. (${ctx.sourceService})`,
        contentType: isEmail ? 'text/html' : undefined,
        service: ctx.sourceService,
        fromName,
      }, baseUrl, 'SUBMITTER');
      this.logger.log('sendLeadConfirmation: SUBMITTER confirmation sent OK');
      return true;
    } catch (e) {
      this.logger.error(`sendLeadConfirmation: SUBMITTER confirmation failed: ${(e as Error).message}`);
      return false;
    }
  }
}
