type ContactMethodLike = {
  type?: string | null;
  value?: string | null;
};

export type LeadLifecycleInput = {
  id: string;
  status?: string | null;
  sourceService: string;
  sourceUrl?: string | null;
  sourceLabel?: string | null;
  contactMethods?: ContactMethodLike[] | null;
  preferredChannel?: string | null;
  fallbackChannels?: unknown[] | null;
  marketingConsent?: boolean | null;
  consentSource?: string | null;
  consentCapturedAt?: Date | string | null;
  confirmedAt?: Date | string | null;
  unsubscribedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

export type LeadConvertedToUserInput = {
  leadId: string;
  userId: string;
  sourceService: string;
  linkMethod: 'verified_contact' | 'conversion_token' | 'owner_reviewed_manual_link';
  linkedAt: Date | string;
};

export type LifecycleEventEnvelope<TEventType extends string, TPayload> = {
  eventId: string;
  eventType: TEventType;
  eventVersion: 1;
  occurredAt: string;
  producer: 'leads-microservice';
  leadId: string;
  correlationId?: string;
  idempotencyKey?: string;
  dataClass: 'minimized';
  payload: TPayload;
};

export type LifecycleEventOptions = {
  eventId: string;
  occurredAt: Date | string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type LeadSubmittedPayload = {
  leadId: string;
  status: string | null;
  sourceService: string;
  sourceLabel: string | null;
  sourceHost: string | null;
  contactMethodTypes: string[];
  contactMethodCount: number;
  preferredChannel: string | null;
  fallbackChannelCount: number;
  marketingConsent: boolean | null;
  consentEvidencePresent: boolean;
  confirmed: boolean;
  unsubscribed: boolean;
  createdAt: string | null;
};

export type LeadConfirmedPayload = {
  leadId: string;
  sourceService: string;
  confirmedAt: string;
};

export type LeadPreferenceUpdatedPayload = {
  leadId: string;
  marketingConsent: boolean | null;
  consentEvidencePresent: boolean;
  preferredChannel: string | null;
  fallbackChannelCount: number;
  unsubscribedAt: string | null;
  updatedAt: string | null;
};

export type LeadConvertedToUserPayload = {
  leadId: string;
  userId: string;
  sourceService: string;
  linkMethod: LeadConvertedToUserInput['linkMethod'];
  linkedAt: string;
};

function toIsoString(value?: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

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

function contactMethodTypes(input: LeadLifecycleInput): string[] {
  return uniqueSorted(
    (input.contactMethods ?? [])
      .map((method) => method.type)
      .filter((type): type is string => Boolean(type)),
  );
}

function consentEvidencePresent(input: LeadLifecycleInput): boolean {
  return Boolean(input.consentSource && input.consentCapturedAt);
}

function envelope<TEventType extends string, TPayload>(
  eventType: TEventType,
  leadId: string,
  payload: TPayload,
  options: LifecycleEventOptions,
): LifecycleEventEnvelope<TEventType, TPayload> {
  return {
    eventId: options.eventId,
    eventType,
    eventVersion: 1,
    occurredAt: toIsoString(options.occurredAt) ?? '',
    producer: 'leads-microservice',
    leadId,
    correlationId: options.correlationId,
    idempotencyKey: options.idempotencyKey,
    dataClass: 'minimized',
    payload,
  };
}

export function buildLeadSubmittedEvent(
  input: LeadLifecycleInput,
  options: LifecycleEventOptions,
): LifecycleEventEnvelope<'LeadSubmitted', LeadSubmittedPayload> {
  const payload: LeadSubmittedPayload = {
    leadId: input.id,
    status: input.status ?? null,
    sourceService: input.sourceService,
    sourceLabel: input.sourceLabel ?? null,
    sourceHost: getSourceHost(input.sourceUrl),
    contactMethodTypes: contactMethodTypes(input),
    contactMethodCount: input.contactMethods?.length ?? 0,
    preferredChannel: input.preferredChannel ?? null,
    fallbackChannelCount: input.fallbackChannels?.length ?? 0,
    marketingConsent: input.marketingConsent ?? null,
    consentEvidencePresent: consentEvidencePresent(input),
    confirmed: Boolean(input.confirmedAt),
    unsubscribed: Boolean(input.unsubscribedAt),
    createdAt: toIsoString(input.createdAt),
  };

  return envelope('LeadSubmitted', input.id, payload, options);
}

export function buildLeadConfirmedEvent(
  input: Pick<LeadLifecycleInput, 'id' | 'sourceService' | 'confirmedAt'>,
  options: LifecycleEventOptions,
): LifecycleEventEnvelope<'LeadConfirmed', LeadConfirmedPayload> {
  const confirmedAt = toIsoString(input.confirmedAt);
  if (!confirmedAt) {
    throw new Error('confirmedAt is required for LeadConfirmed');
  }

  return envelope(
    'LeadConfirmed',
    input.id,
    {
      leadId: input.id,
      sourceService: input.sourceService,
      confirmedAt,
    },
    options,
  );
}

export function buildLeadPreferenceUpdatedEvent(
  input: LeadLifecycleInput,
  options: LifecycleEventOptions,
): LifecycleEventEnvelope<'LeadPreferenceUpdated', LeadPreferenceUpdatedPayload> {
  return envelope(
    'LeadPreferenceUpdated',
    input.id,
    {
      leadId: input.id,
      marketingConsent: input.marketingConsent ?? null,
      consentEvidencePresent: consentEvidencePresent(input),
      preferredChannel: input.preferredChannel ?? null,
      fallbackChannelCount: input.fallbackChannels?.length ?? 0,
      unsubscribedAt: toIsoString(input.unsubscribedAt),
      updatedAt: toIsoString(input.updatedAt),
    },
    options,
  );
}

export function buildLeadConvertedToUserEvent(
  input: LeadConvertedToUserInput,
  options: LifecycleEventOptions,
): LifecycleEventEnvelope<'LeadConvertedToUser', LeadConvertedToUserPayload> {
  return envelope(
    'LeadConvertedToUser',
    input.leadId,
    {
      leadId: input.leadId,
      userId: input.userId,
      sourceService: input.sourceService,
      linkMethod: input.linkMethod,
      linkedAt: toIsoString(input.linkedAt) ?? '',
    },
    options,
  );
}
