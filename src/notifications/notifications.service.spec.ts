import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { NotificationsService } from './notifications.service';

function collectLoggerOutput(spies: Array<jest.SpyInstance>) {
  return spies
    .flatMap((spy) => spy.mock.calls)
    .map((call) => call.join(' '))
    .join('\n');
}

describe('NotificationsService', () => {
  const originalEnv = { ...process.env };
  let post: jest.Mock;
  let service: NotificationsService;
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NOTIFICATION_SERVICE_URL = 'http://notifications-service';
    delete process.env.ADMIN_EMAIL;
    delete process.env.NOTIFICATIONS_SERVICE_TOKEN;

    post = jest.fn().mockReturnValue(of({ status: 200, data: { ok: true } }));
    service = new NotificationsService({ post } as any);

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    process.env = originalEnv;
  });

  it('returns false without sending when notifications URL is missing', async () => {
    delete process.env.NOTIFICATION_SERVICE_URL;

    const result = await service.sendLeadConfirmation(
      [{ type: 'email', value: 'person@example.test' }],
      {
        message: 'synthetic message',
        sourceService: 'statex',
        confirmationToken: 'synthetic-token',
      },
    );

    expect(result).toBe(false);
    expect(post).not.toHaveBeenCalled();
  });

  it('keeps admin notification failure non-fatal for submitter confirmation', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.test';
    post
      .mockReturnValueOnce(throwError(() => new Error('admin failed')))
      .mockReturnValueOnce(of({ status: 200, data: { ok: true } }));

    const result = await service.sendLeadConfirmation(
      [{ type: 'email', value: 'person@example.test' }],
      {
        name: 'Synthetic Lead',
        message: 'synthetic message',
        sourceService: 'statex',
        sourceUrl: 'https://statex.example/private-path',
        confirmationToken: 'synthetic-token',
      },
    );

    expect(result).toBe(true);
    expect(post).toHaveBeenCalledTimes(2);
  });

  it('returns false when submitter confirmation fails', async () => {
    post.mockReturnValueOnce(throwError(() => new Error('submitter failed')));

    const result = await service.sendLeadConfirmation(
      [{ type: 'email', value: 'person@example.test' }],
      {
        message: 'synthetic message',
        sourceService: 'statex',
        confirmationToken: 'synthetic-token',
      },
    );

    expect(result).toBe(false);
  });

  it('does not write raw recipient, message, source URL, or confirmation token to logs', async () => {
    await service.sendLeadConfirmation(
      [{ type: 'email', value: 'person@example.test' }],
      {
        name: 'Synthetic Lead',
        message: 'synthetic private message',
        sourceService: 'statex',
        sourceUrl: 'https://statex.example/private-path?token=query-token',
        confirmationToken: 'synthetic-confirmation-token',
      },
    );

    const output = collectLoggerOutput([logSpy, warnSpy, errorSpy]);

    expect(output).not.toContain('person@example.test');
    expect(output).not.toContain('synthetic private message');
    expect(output).not.toContain('private-path');
    expect(output).not.toContain('query-token');
    expect(output).not.toContain('synthetic-confirmation-token');
  });
});
