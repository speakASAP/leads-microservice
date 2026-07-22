/**
 * EP-005 W5 — turning an `auth.user.registered.v1` into a lead (C-005 §2.3).
 *
 * Pure on purpose. Everything here decides *what* a lead made from a registration should look
 * like, without touching a database or a broker, because the parts that are easy to get quietly
 * wrong — which correlationId to carry, what to write where a person wrote nothing, whether a
 * registration implies consent — are the parts worth being able to test cheaply.
 */

export const USER_REGISTERED = 'auth.user.registered.v1';
export const LEAD_CREATED_FROM_REGISTRATION = 'growth.lead.created_from_registration.v1';

/** The lead did not come from a form. Saying so plainly beats inventing an enquiry. */
const REGISTRATION_MESSAGE = 'Registrace uživatele přes Alfares Auth (bez zprávy od uživatele).';

export interface ParsedRegistration {
  userId: string;
  /** From the payload only — see below. Absent for anyone who did not come through a landing. */
  correlationId?: string;
  email?: string;
  phone?: string;
  applicationContext?: string;
  registeredAt?: string;
}

/**
 * Reads a registration event, or returns nothing.
 *
 * Never throws. This arrives off a queue from another service, so anything at all may be in it,
 * and an exception here would take down the consumer for every message queued behind it.
 */
export function parseRegistrationEvent(candidate: unknown): ParsedRegistration | undefined {
  if (typeof candidate !== 'object' || candidate === null) return undefined;

  const event = candidate as Record<string, unknown>;
  if (event.eventType !== USER_REGISTERED) return undefined;

  const payload = event.payload;
  if (typeof payload !== 'object' || payload === null) return undefined;

  const fields = payload as Record<string, unknown>;
  const userId = str(fields.userId);
  // Without a user there is no identity to attach the lead to, and nothing to deduplicate on.
  if (!userId) return undefined;

  return {
    userId,
    // The PAYLOAD's correlationId, never the envelope's. The envelope carries a tracing id auth
    // mints for every registration including direct signups; joining leads to touchpoints on it
    // would attach them to whichever visit happened to share the value.
    correlationId: str(fields.correlationId),
    email: str(fields.email),
    phone: str(fields.phone),
    applicationContext: str(fields.applicationContext),
    registeredAt: str(fields.registeredAt),
  };
}

export interface RegistrationLeadInput {
  authUserId: string;
  sourceService: string;
  sourceLabel?: string;
  message: string;
  marketingConsent?: boolean;
  contactMethods: Array<{ type: string; value: string; isPrimary: boolean }>;
}

export function leadInputFromRegistration(registration: ParsedRegistration): RegistrationLeadInput {
  const contactMethods: RegistrationLeadInput['contactMethods'] = [];
  if (registration.email) {
    contactMethods.push({ type: 'email', value: registration.email, isPrimary: true });
  }
  if (registration.phone) {
    contactMethods.push({ type: 'phone', value: registration.phone, isPrimary: !registration.email });
  }

  return {
    authUserId: registration.userId,
    sourceService: 'auth-microservice',
    sourceLabel: registration.applicationContext,
    message: REGISTRATION_MESSAGE,
    // Deliberately unset. Registering is not consent to be marketed at, and defaulting this to
    // true would manufacture a permission nobody gave.
    marketingConsent: undefined,
    contactMethods,
  };
}

export interface LeadCreatedInput {
  leadId: string;
  userId: string;
  correlationId?: string;
  workspaceId: string;
  now: Date;
  eventId: string;
}

export function buildLeadCreatedEnvelope(input: LeadCreatedInput) {
  const createdAt = input.now.toISOString();

  const payload: Record<string, unknown> = {
    leadId: input.leadId,
    userId: input.userId,
    sourceService: 'auth-microservice',
    createdAt,
  };
  // Absent rather than null: the schema forbids unknown shapes, and a null would be rejected by
  // the consumer — which shows up as a silently missing lead rather than as an error.
  if (input.correlationId) payload.correlationId = input.correlationId;

  return {
    eventId: input.eventId,
    eventType: LEAD_CREATED_FROM_REGISTRATION,
    eventVersion: 1,
    occurredAt: createdAt,
    producer: 'leads-microservice',
    workspaceId: input.workspaceId,
    correlationId: input.correlationId ?? input.userId,
    dataClass: 'personal',
    // No email, phone or name here. The lead holds those; this event points at the lead. Copying
    // personal data into an event duplicates it into every queue, log and consumer downstream.
    payload,
  };
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
