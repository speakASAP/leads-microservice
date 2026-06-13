export const PRODUCT_APP_SOURCE_SERVICES = [
  'shop-assistant',
  'buzzos',
  'flipflop',
  'speakup',
  'marathon',
  'statex',
  'sgiprealestate',
  'leads-landing',
  'shared-landing',
] as const;

export type ProductAppSourceService = (typeof PRODUCT_APP_SOURCE_SERVICES)[number];

export const PRODUCT_APP_SOURCE_LABELS = [
  'request-access',
  'book-demo',
  'pricing-interest',
  'waitlist',
  'trial-request',
  'feature-interest',
  'abandoned-intent',
  'newsletter',
  'support-contact',
  'lead-magnet',
] as const;

export type ProductAppSourceLabel = (typeof PRODUCT_APP_SOURCE_LABELS)[number];

export const PRODUCT_APP_METADATA_KEYS = [
  'intent',
  'surface',
  'campaignKey',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'referrerHost',
  'locale',
  'productKey',
  'featureKey',
  'variantKey',
] as const;

export type ProductAppMetadataKey = (typeof PRODUCT_APP_METADATA_KEYS)[number];

type ContactMethod = {
  type: 'email' | 'telegram' | 'whatsapp';
  value: string;
};

export type ProductAppLeadInput = {
  sourceService: ProductAppSourceService;
  sourceLabel: ProductAppSourceLabel;
  sourceUrl?: string;
  message: string;
  contactMethods: ContactMethod[];
  preferredChannel?: 'email' | 'telegram' | 'whatsapp' | 'none';
  fallbackChannels?: string[];
  marketingConsent?: boolean;
  consentSource?: string;
  consentCapturedAt?: string;
  metadata?: Partial<Record<ProductAppMetadataKey | string, unknown>>;
};

export type ProductAppLeadPayload = {
  sourceService: ProductAppSourceService;
  sourceLabel: ProductAppSourceLabel;
  sourceUrl?: string;
  message: string;
  contactMethods: ContactMethod[];
  preferredChannel?: 'email' | 'telegram' | 'whatsapp' | 'none';
  fallbackChannels?: string[];
  marketingConsent?: boolean;
  consentSource?: string;
  consentCapturedAt?: string;
  metadata?: Partial<Record<ProductAppMetadataKey, unknown>>;
};

export type ProductAppLeadLogSummary = {
  sourceService: ProductAppSourceService;
  sourceLabel: ProductAppSourceLabel;
  sourceHost: string | null;
  messageLength: number;
  contactMethodCount: number;
  contactMethodTypes: string[];
  metadataKeys: string[];
  marketingConsent: boolean | null;
  consentEvidencePresent: boolean;
};

function isIncluded<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return values.includes(value);
}

function getSourceHost(sourceUrl?: string): string | null {
  if (!sourceUrl) {
    return null;
  }

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function filterMetadata(
  metadata?: Partial<Record<ProductAppMetadataKey | string, unknown>>,
): Partial<Record<ProductAppMetadataKey, unknown>> | undefined {
  if (!metadata) {
    return undefined;
  }

  const allowedEntries = Object.entries(metadata).filter(([key]) =>
    isIncluded(PRODUCT_APP_METADATA_KEYS, key),
  ) as [ProductAppMetadataKey, unknown][];

  if (allowedEntries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(allowedEntries) as Partial<Record<ProductAppMetadataKey, unknown>>;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export function buildProductAppLeadPayload(input: ProductAppLeadInput): ProductAppLeadPayload {
  if (!isIncluded(PRODUCT_APP_SOURCE_SERVICES, input.sourceService)) {
    throw new Error(`Unsupported sourceService: ${input.sourceService}`);
  }

  if (!isIncluded(PRODUCT_APP_SOURCE_LABELS, input.sourceLabel)) {
    throw new Error(`Unsupported sourceLabel: ${input.sourceLabel}`);
  }

  const payload: ProductAppLeadPayload = {
    sourceService: input.sourceService,
    sourceLabel: input.sourceLabel,
    sourceUrl: input.sourceUrl,
    message: input.message,
    contactMethods: input.contactMethods,
    preferredChannel: input.preferredChannel,
    fallbackChannels: input.fallbackChannels,
    marketingConsent: input.marketingConsent,
    consentSource: input.consentSource,
    consentCapturedAt: input.consentCapturedAt,
    metadata: filterMetadata(input.metadata),
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key as keyof ProductAppLeadPayload] === undefined) {
      delete payload[key as keyof ProductAppLeadPayload];
    }
  });

  return payload;
}

export function buildProductAppLeadLogSummary(input: ProductAppLeadPayload): ProductAppLeadLogSummary {
  return {
    sourceService: input.sourceService,
    sourceLabel: input.sourceLabel,
    sourceHost: getSourceHost(input.sourceUrl),
    messageLength: input.message.length,
    contactMethodCount: input.contactMethods.length,
    contactMethodTypes: uniqueSorted(input.contactMethods.map((method) => method.type)),
    metadataKeys: Object.keys(input.metadata ?? {}).sort(),
    marketingConsent: input.marketingConsent ?? null,
    consentEvidencePresent: Boolean(input.consentSource && input.consentCapturedAt),
  };
}
