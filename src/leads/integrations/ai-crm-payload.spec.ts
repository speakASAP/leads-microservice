import { buildSanitizedAiCrmLeadContext } from './ai-crm-payload';

describe('buildSanitizedAiCrmLeadContext', () => {
  it('omits contact values, raw message, confirmation token, private URL, and metadata values', () => {
    const context = buildSanitizedAiCrmLeadContext({
      id: 'lead_synthetic_1',
      status: 'new',
      sourceService: 'statex',
      sourceUrl: 'https://alfares.example/contact/private-path?token=synthetic-url-token',
      sourceLabel: 'contact-form',
      message: 'Synthetic raw lead message with identifying business details.',
      contactMethods: [
        { type: 'email', value: 'person@example.test' },
        { type: 'telegram', value: '@synthetic_person' },
      ],
      metadata: {
        campaign: 'synthetic-private-campaign-value',
        page: '/private/contact/path',
      },
      preferredChannel: 'email',
      fallbackChannels: ['telegram'],
      marketingConsent: true,
      consentSource: 'synthetic-consent-source-form-id',
      consentCapturedAt: '2026-06-13T00:00:00.000Z',
      confirmedAt: null,
      unsubscribedAt: null,
      confirmationToken: 'synthetic-confirmation-token',
    });

    expect(context).toEqual({
      leadId: 'lead_synthetic_1',
      status: 'new',
      sourceService: 'statex',
      sourceLabel: 'contact-form',
      sourceHost: 'alfares.example',
      messageLength: 61,
      contactMethodCount: 2,
      contactMethodTypes: ['email', 'telegram'],
      metadataKeys: ['campaign', 'page'],
      consent: {
        marketingConsent: true,
        consentSourcePresent: true,
        consentCapturedAtPresent: true,
      },
      preference: {
        preferredChannel: 'email',
        fallbackChannelCount: 1,
      },
      lifecycle: {
        confirmed: false,
        unsubscribed: false,
      },
    });

    const serialized = JSON.stringify(context);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('@synthetic_person');
    expect(serialized).not.toContain('Synthetic raw lead message');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('private-path');
    expect(serialized).not.toContain('synthetic-url-token');
    expect(serialized).not.toContain('synthetic-private-campaign-value');
    expect(serialized).not.toContain('synthetic-consent-source-form-id');
  });

  it('does not leak malformed source URLs', () => {
    const context = buildSanitizedAiCrmLeadContext({
      id: 'lead_synthetic_2',
      sourceService: 'statex',
      sourceUrl: 'not a private url /secret/path?token=hidden',
      message: null,
      contactMethods: [],
      metadata: null,
    });

    expect(context.sourceHost).toBeNull();
    expect(JSON.stringify(context)).not.toContain('secret/path');
  });
});
