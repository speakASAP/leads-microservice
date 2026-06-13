type ContactMethodLike = {
  type?: string | null;
  value?: string | null;
};

export type AiCrmLeadContextInput = {
  id: string;
  status?: string | null;
  sourceService: string;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
  message?: string | null;
  contactMethods?: ContactMethodLike[] | null;
  metadata?: Record<string, unknown> | null;
  preferredChannel?: string | null;
  fallbackChannels?: unknown[] | null;
  marketingConsent?: boolean | null;
  consentSource?: string | null;
  consentCapturedAt?: Date | string | null;
  confirmedAt?: Date | string | null;
  unsubscribedAt?: Date | string | null;
  confirmationToken?: string | null;
};

export type SanitizedAiCrmLeadContext = {
  leadId: string;
  status: string | null;
  sourceService: string;
  sourceLabel: string | null;
  sourceHost: string | null;
  messageLength: number;
  contactMethodCount: number;
  contactMethodTypes: string[];
  metadataKeys: string[];
  consent: {
    marketingConsent: boolean | null;
    consentSourcePresent: boolean;
    consentCapturedAtPresent: boolean;
  };
  preference: {
    preferredChannel: string | null;
    fallbackChannelCount: number;
  };
  lifecycle: {
    confirmed: boolean;
    unsubscribed: boolean;
  };
};

function getSourceHost(sourceUrl?: string | null): string | null {
  if (!sourceUrl) {
    return null;
  }

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

export function buildSanitizedAiCrmLeadContext(input: AiCrmLeadContextInput): SanitizedAiCrmLeadContext {
  const contactMethodTypes = uniqueSorted(
    (input.contactMethods ?? [])
      .map((method) => method.type)
      .filter((type): type is string => Boolean(type)),
  );

  return {
    leadId: input.id,
    status: input.status ?? null,
    sourceService: input.sourceService,
    sourceLabel: input.sourceLabel ?? null,
    sourceHost: getSourceHost(input.sourceUrl),
    messageLength: input.message?.length ?? 0,
    contactMethodCount: input.contactMethods?.length ?? 0,
    contactMethodTypes,
    metadataKeys: Object.keys(input.metadata ?? {}).sort(),
    consent: {
      marketingConsent: input.marketingConsent ?? null,
      consentSourcePresent: Boolean(input.consentSource),
      consentCapturedAtPresent: Boolean(input.consentCapturedAt),
    },
    preference: {
      preferredChannel: input.preferredChannel ?? null,
      fallbackChannelCount: input.fallbackChannels?.length ?? 0,
    },
    lifecycle: {
      confirmed: Boolean(input.confirmedAt),
      unsubscribed: Boolean(input.unsubscribedAt),
    },
  };
}
