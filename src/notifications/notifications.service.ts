import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

type ContactMethod = {
  type: string;
  value: string;
};

type LeadContext = {
  name?: string;
  message: string;
  sourceService: string;
  sourceUrl?: string;
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
<head><meta charset="UTF-8"><title>Nový zájem — ${domain}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;">
  <tr><td align="center" style="padding:20px 0;">
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.15);">
      <tr><td style="background-color:#1E88E5;padding:14px 24px;">
        <span style="color:#fff;font-size:18px;font-family:Arial,sans-serif;">Nový zájem — ${domain}</span>
      </td></tr>
      <tr><td style="background:#fff;padding:28px 24px;font-family:Arial,sans-serif;color:#333;">
        ${ctx.name ? `<p style="margin:0 0 12px;font-size:15px;">Jméno: <strong>${ctx.name}</strong></p>` : ''}
        <p style="margin:0 0 8px;font-size:14px;color:#555;">Kontakt:</p>
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">${contactRows}</table>
        <table cellpadding="0" cellspacing="0" border="0" width="100%"
               style="border-left:4px solid #1E88E5;background:#E3F2FD;border-radius:0 4px 4px 0;margin-bottom:20px;">
          <tr><td style="padding:14px 16px;font-size:14px;color:#1a1a1a;line-height:1.6;">
            <strong style="display:block;margin-bottom:6px;color:#1E88E5;">Zpráva:</strong>
            ${ctx.message.replace(/\n/g, '<br>')}
          </td></tr>
        </table>
        <p style="margin:0;font-size:13px;color:#888;">Zdroj: ${ctx.sourceService}${ctx.sourceUrl ? ` · ${ctx.sourceUrl}` : ''}</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildHtml(ctx: LeadContext): string {
  const greeting = ctx.name ? `Dobrý den, ${ctx.name}!` : 'Dobrý den!';
  const domain = ctx.sourceUrl
    ? new URL(ctx.sourceUrl).hostname.replace(/^www\./, '')
    : ctx.sourceService;

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

            <p style="margin:0 0 24px;">
              Pokud máte další otázky, neváhejte nás kontaktovat.
            </p>

            <p style="margin:0;">
              <a href="https://speakasap.com/">
                <img src="https://speakasap.com/static/img/logo_big.png" width="140" alt="SpeakASAP logo"
                     style="display:block;margin-bottom:8px;">
              </a>
              S pozdravem,<br>
              <strong>Tým ${domain}</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#1E88E5;padding:16px 24px;border-radius:0 0 8px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-family:Arial,sans-serif;font-size:12px;color:#fff;line-height:1.6;">
                  Email: <a href="mailto:contact@speakasap.com" style="color:#fff;text-decoration:none;">contact@speakasap.com</a>
                </td>
                <td align="right">
                  <a href="https://play.google.com/store/apps/dev?id=5886045250381103493" target="_blank">
                    <img src="https://speakasap.com/static/img/app_google_play.png" alt="Google Play" width="80">
                  </a>
                  &nbsp;
                  <a href="https://apps.apple.com/us/developer/alfares-s-r-o/id977918347" target="_blank">
                    <img src="https://speakasap.com/static/img/app_store.png" alt="App Store" width="80">
                  </a>
                </td>
              </tr>
            </table>
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
  constructor(private readonly httpService: HttpService) {}

  private async sendViaNotifications(
    payload: Record<string, unknown>,
    baseUrl: string,
  ): Promise<void> {
    const serviceToken = process.env.NOTIFICATIONS_SERVICE_TOKEN;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (serviceToken) {
      headers['Authorization'] = `Bearer ${serviceToken}`;
    }
    await lastValueFrom(this.httpService.post(`${baseUrl}/notifications/send`, payload, { headers }));
  }

  async sendLeadConfirmation(
    contactMethods: ContactMethod[],
    ctx: LeadContext,
  ): Promise<boolean> {
    const baseUrl = process.env.NOTIFICATION_SERVICE_URL;
    if (!baseUrl) {
      return false;
    }

    const domain = ctx.sourceUrl
      ? (() => { try { return new URL(ctx.sourceUrl!).hostname.replace(/^www\./, ''); } catch { return ctx.sourceService; } })()
      : ctx.sourceService;

    // Admin notification — always sent regardless of submitter contact type
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        await this.sendViaNotifications({
          channel: 'email',
          type: 'custom',
          recipient: adminEmail,
          subject: `Nový zájem — ${domain}${ctx.name ? ` od ${ctx.name}` : ''}`,
          message: buildAdminHtml(ctx, contactMethods),
          contentType: 'text/html',
          service: ctx.sourceService,
          fromEmail: `contact@${domain}`,
          fromName: domain,
        }, baseUrl);
      } catch {
        // admin notification failure is non-fatal
      }
    }

    // Confirmation to submitter
    if (contactMethods.length === 0) {
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

    const isEmail = selected.type === 'email';
    const html = isEmail ? buildHtml(ctx) : undefined;

    let fromEmail: string | undefined;
    let fromName: string | undefined;
    if (isEmail) {
      fromEmail = `contact@${domain}`;
      fromName = domain;
    }

    try {
      await this.sendViaNotifications({
        channel: channelMap[selected.type],
        type: 'custom',
        recipient: selected.value,
        subject: isEmail ? `Vaše zpráva byla přijata — ${ctx.sourceService}` : undefined,
        message: isEmail ? html : `Vaše zpráva byla přijata. Brzy se vám ozveme. (${ctx.sourceService})`,
        contentType: isEmail ? 'text/html' : undefined,
        service: ctx.sourceService,
        fromEmail,
        fromName,
      }, baseUrl);
      return true;
    } catch {
      return false;
    }
  }
}
