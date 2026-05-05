import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLeadDto } from './create-lead.dto';

describe('CreateLeadDto', () => {
  it('accepts valid ISO8601 consentCapturedAt', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      sourceService: 'marketing-microservice',
      message: 'hello',
      contactMethods: [{ type: 'email', value: 'x@example.com' }],
      consentCapturedAt: '2026-05-05T08:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects invalid consentCapturedAt', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      sourceService: 'marketing-microservice',
      message: 'hello',
      contactMethods: [{ type: 'email', value: 'x@example.com' }],
      consentCapturedAt: 'invalid-date',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
