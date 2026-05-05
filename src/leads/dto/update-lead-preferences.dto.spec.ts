import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateLeadPreferencesDto } from './update-lead-preferences.dto';

describe('UpdateLeadPreferencesDto', () => {
  it('accepts ISO8601 consent/unsubscribe timestamps', async () => {
    const dto = plainToInstance(UpdateLeadPreferencesDto, {
      consentCapturedAt: '2026-05-05T08:00:00.000Z',
      unsubscribedAt: '2026-05-05T09:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-ISO timestamp values', async () => {
    const dto = plainToInstance(UpdateLeadPreferencesDto, {
      consentCapturedAt: 'invalid',
      unsubscribedAt: 'not-a-date',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
