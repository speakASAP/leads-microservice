import {
  buildProductAppLeadPayload,
  type ProductAppLeadPayload,
  type ProductAppSourceLabel,
  type ProductAppSourceService,
  PRODUCT_APP_SOURCE_SERVICES,
} from './product-app-intake';

export const PRODUCT_APP_CONTACT_METHOD_TYPES = ['email', 'telegram', 'whatsapp'] as const;

export type ProductAppContactMethodType = (typeof PRODUCT_APP_CONTACT_METHOD_TYPES)[number];

export type ProductAppIntakeCompatibilityFixture = {
  id: string;
  sourceService: ProductAppSourceService;
  contactMethodType: ProductAppContactMethodType;
  payload: ProductAppLeadPayload;
};

const SOURCE_LABEL_BY_SERVICE: Record<ProductAppSourceService, ProductAppSourceLabel> = {
  'shop-assistant': 'pricing-interest',
  buzzos: 'waitlist',
  flipflop: 'trial-request',
  speakup: 'book-demo',
  marathon: 'feature-interest',
  statex: 'request-access',
  sgiprealestate: 'support-contact',
  'leads-landing': 'request-access',
  'shared-landing': 'lead-magnet',
};

function contactValue(
  sourceService: ProductAppSourceService,
  contactMethodType: ProductAppContactMethodType,
): string {
  const slug = sourceService.replace(/-/g, '_');

  if (contactMethodType === 'email') {
    return `${slug}.lead@example.test`;
  }

  if (contactMethodType === 'telegram') {
    return `@${slug}_lead`;
  }

  return `synthetic-whatsapp-${sourceService}`;
}

function fallbackChannels(contactMethodType: ProductAppContactMethodType): ProductAppContactMethodType[] {
  return PRODUCT_APP_CONTACT_METHOD_TYPES.filter((method) => method !== contactMethodType);
}

function buildFixture(
  sourceService: ProductAppSourceService,
  contactMethodType: ProductAppContactMethodType,
): ProductAppIntakeCompatibilityFixture {
  const sourceLabel = SOURCE_LABEL_BY_SERVICE[sourceService];

  return {
    id: `${sourceService}:${contactMethodType}`,
    sourceService,
    contactMethodType,
    payload: buildProductAppLeadPayload({
      sourceService,
      sourceLabel,
      sourceUrl: `https://${sourceService}.example.test/leads/intake`,
      message: `Synthetic ${sourceService} ${contactMethodType} intake compatibility message.`,
      contactMethods: [
        {
          type: contactMethodType,
          value: contactValue(sourceService, contactMethodType),
        },
      ],
      preferredChannel: contactMethodType,
      fallbackChannels: fallbackChannels(contactMethodType),
      marketingConsent: true,
      consentSource: `${sourceService}:${sourceLabel}:synthetic-matrix:v1`,
      consentCapturedAt: '2026-06-13T00:00:00.000Z',
      metadata: {
        intent: `${sourceService}-${contactMethodType}-compatibility`,
        surface: 'synthetic-matrix',
        productKey: sourceService,
        variantKey: contactMethodType,
      },
    }),
  };
}

export const PRODUCT_APP_INTAKE_COMPATIBILITY_FIXTURES: ProductAppIntakeCompatibilityFixture[] =
  PRODUCT_APP_SOURCE_SERVICES.flatMap((sourceService) =>
    PRODUCT_APP_CONTACT_METHOD_TYPES.map((contactMethodType) => buildFixture(sourceService, contactMethodType)),
  );
