import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLeadDto } from './create-lead.dto';

const validPayload = {
  sourceService: 'marketing-microservice',
  message: 'hello',
  contactMethods: [{ type: 'email', value: 'x@example.com' }],
};

describe('CreateLeadDto', () => {
  it('accepts valid ISO8601 consentCapturedAt', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      consentCapturedAt: '2026-05-05T08:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects invalid consentCapturedAt', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      consentCapturedAt: 'invalid-date',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts marketing consent with source and captured timestamp evidence', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      marketingConsent: true,
      consentSource: 'public-contact-form',
      consentCapturedAt: '2026-05-05T08:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts missing marketing consent without consent evidence as no opt-in', async () => {
    const dto = plainToInstance(CreateLeadDto, validPayload);

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts false marketing consent without consent evidence as no opt-in', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      marketingConsent: false,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects marketing consent without consentSource', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      marketingConsent: true,
      consentCapturedAt: '2026-05-05T08:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects marketing consent with empty consentSource', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      marketingConsent: true,
      consentSource: '',
      consentCapturedAt: '2026-05-05T08:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects marketing consent without consentCapturedAt', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      marketingConsent: true,
      consentSource: 'public-contact-form',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects empty contactMethods', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      contactMethods: [],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects more than 30 contactMethods', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      contactMethods: Array.from({ length: 31 }, (_, index) => ({
        type: 'email',
        value: `contact-${index}@example.com`,
      })),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects unsupported contact method types', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      contactMethods: [{ type: 'sms', value: '+15550123' }],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('rejects contact methods without a value', async () => {
    const dto = plainToInstance(CreateLeadDto, {
      ...validPayload,
      contactMethods: [{ type: 'email', value: '' }],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
