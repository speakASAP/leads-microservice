import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateLeadDto } from '../dto/create-lead.dto';
import {
  buildProductAppLeadLogSummary,
  buildProductAppLeadPayload,
  PRODUCT_APP_METADATA_KEYS,
  PRODUCT_APP_SOURCE_LABELS,
  PRODUCT_APP_SOURCE_SERVICES,
} from './product-app-intake';

async function expectDtoValid(payload: unknown) {
  const dto = plainToInstance(CreateLeadDto, payload);
  const errors = await validate(dto);
  expect(errors).toHaveLength(0);
}

describe('product app intake helpers', () => {
  it('defines the initial source service and label taxonomy', () => {
    expect(PRODUCT_APP_SOURCE_SERVICES).toEqual([
      'shop-assistant',
      'buzzos',
      'flipflop',
      'speakup',
      'marathon',
      'statex',
      'sgiprealestate',
      'leads-landing',
      'shared-landing',
    ]);
    expect(PRODUCT_APP_SOURCE_LABELS).toContain('pricing-interest');
    expect(PRODUCT_APP_METADATA_KEYS).toContain('intent');
  });

  it('builds a DTO-compatible product app payload with consent evidence', async () => {
    const payload = buildProductAppLeadPayload({
      sourceService: 'shop-assistant',
      sourceLabel: 'pricing-interest',
      sourceUrl: 'https://shop.example/private/pricing?token=synthetic-url-token',
      message: 'Synthetic product-app lead message with private details.',
      contactMethods: [{ type: 'email', value: 'person@example.test' }],
      preferredChannel: 'email',
      fallbackChannels: ['telegram'],
      marketingConsent: true,
      consentSource: 'shop-assistant-pricing:v1',
      consentCapturedAt: '2026-06-13T00:00:00.000Z',
      metadata: {
        intent: 'pricing_interest',
        surface: 'pricing_page',
        privateNote: 'synthetic-private-note',
      },
    });

    expect(payload.metadata).toEqual({
      intent: 'pricing_interest',
      surface: 'pricing_page',
    });
    await expectDtoValid(payload);
  });

  it('builds safe log summaries without contact values, raw messages, private URLs, metadata values, or consent source', () => {
    const payload = buildProductAppLeadPayload({
      sourceService: 'speakup',
      sourceLabel: 'book-demo',
      sourceUrl: 'https://speakup.example/private/demo?token=synthetic-url-token',
      message: 'Synthetic raw lesson goal with identifying details.',
      contactMethods: [
        { type: 'email', value: 'learner@example.test' },
        { type: 'telegram', value: '@synthetic_learner' },
      ],
      marketingConsent: true,
      consentSource: 'speakup-demo:v1',
      consentCapturedAt: '2026-06-13T00:00:00.000Z',
      metadata: {
        intent: 'book_demo',
        privateValue: 'synthetic-private-value',
      },
    });

    const summary = buildProductAppLeadLogSummary(payload);

    expect(summary).toEqual({
      sourceService: 'speakup',
      sourceLabel: 'book-demo',
      sourceHost: 'speakup.example',
      messageLength: 51,
      contactMethodCount: 2,
      contactMethodTypes: ['email', 'telegram'],
      metadataKeys: ['intent'],
      marketingConsent: true,
      consentEvidencePresent: true,
    });

    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain('learner@example.test');
    expect(serialized).not.toContain('@synthetic_learner');
    expect(serialized).not.toContain('Synthetic raw lesson goal');
    expect(serialized).not.toContain('private/demo');
    expect(serialized).not.toContain('synthetic-url-token');
    expect(serialized).not.toContain('synthetic-private-value');
    expect(serialized).not.toContain('speakup-demo:v1');
  });

  it('rejects unsupported taxonomy values', () => {
    expect(() =>
      buildProductAppLeadPayload({
        sourceService: 'unknown-app' as 'shop-assistant',
        sourceLabel: 'pricing-interest',
        message: 'hello',
        contactMethods: [{ type: 'email', value: 'person@example.test' }],
      }),
    ).toThrow('Unsupported sourceService');

    expect(() =>
      buildProductAppLeadPayload({
        sourceService: 'shop-assistant',
        sourceLabel: 'raw freeform label' as 'pricing-interest',
        message: 'hello',
        contactMethods: [{ type: 'email', value: 'person@example.test' }],
      }),
    ).toThrow('Unsupported sourceLabel');
  });

  it('leaves DTO validation to reject unsupported contact method types', async () => {
    const payload = buildProductAppLeadPayload({
      sourceService: 'marathon',
      sourceLabel: 'newsletter',
      message: 'Synthetic marathon reminder request.',
      contactMethods: [{ type: 'sms' as 'email', value: '+15550123' }],
    });

    const dto = plainToInstance(CreateLeadDto, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
