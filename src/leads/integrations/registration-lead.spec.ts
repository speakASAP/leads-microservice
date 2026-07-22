import {
  buildLeadCreatedEnvelope,
  LEAD_CREATED_FROM_REGISTRATION,
  leadInputFromRegistration,
  parseRegistrationEvent,
} from './registration-lead';

/**
 * EP-005 W5 — a registration on `auth-microservice` becomes a lead here (C-005 §2.3).
 *
 * The event arrives from a shared service over a broker, so it is untrusted input in the ordinary
 * sense: anything may be in it, it may arrive twice, and it may arrive for someone who never came
 * through a growth landing at all. None of those are errors.
 */
const registration = (over: Record<string, unknown> = {}) => ({
  eventId: 'aaaaaaaa-0000-4000-8000-000000000001',
  eventType: 'auth.user.registered.v1',
  eventVersion: 1,
  occurredAt: '2026-07-22T10:00:00.000Z',
  producer: 'auth-microservice',
  correlationId: 'envelope-trace',
  dataClass: 'personal',
  payload: {
    userId: 'user-1',
    correlationId: 'corr-from-landing',
    email: 'someone@example.com',
    registrationMethod: 'password',
    applicationContext: 'bazos-service',
    registeredAt: '2026-07-22T10:00:00.000Z',
  },
  ...over,
});

describe('parseRegistrationEvent', () => {
  it('reads the registration it is given', () => {
    expect(parseRegistrationEvent(registration())).toMatchObject({
      userId: 'user-1',
      correlationId: 'corr-from-landing',
      email: 'someone@example.com',
    });
  });

  it('takes the correlationId from the payload, never from the envelope', () => {
    // The envelope's correlationId is a tracing id auth mints for every registration, including
    // direct signups that passed no landing. Carrying that one through would attach leads to
    // touchpoints at random.
    const direct = registration({
      payload: { ...registration().payload, correlationId: undefined },
    });
    expect(parseRegistrationEvent(direct)?.correlationId).toBeUndefined();
  });

  it('accepts a registration with no email — a phone-only user is still a person', () => {
    const phoneOnly = registration({
      payload: { ...registration().payload, email: undefined, phone: '+420777123456' },
    });
    expect(parseRegistrationEvent(phoneOnly)).toMatchObject({ phone: '+420777123456' });
  });

  it('rejects anything without a userId, which is the whole identity of the lead', () => {
    expect(parseRegistrationEvent(registration({ payload: { registeredAt: 'x' } }))).toBeUndefined();
  });

  it('rejects an event of the wrong type rather than guessing', () => {
    expect(parseRegistrationEvent(registration({ eventType: 'orders.order.created.v1' }))).toBeUndefined();
  });

  it('does not throw on junk', () => {
    // It comes off a queue. A crash here would take down the consumer for every message behind it.
    for (const junk of [null, undefined, 42, 'string', [], {}, { payload: null }]) {
      expect(() => parseRegistrationEvent(junk)).not.toThrow();
      expect(parseRegistrationEvent(junk)).toBeUndefined();
    }
  });
});

describe('leadInputFromRegistration', () => {
  const parsed = parseRegistrationEvent(registration())!;

  it('records which user the lead came from, so a redelivery cannot duplicate it', () => {
    expect(leadInputFromRegistration(parsed).authUserId).toBe('user-1');
  });

  it('names the service the lead actually came from', () => {
    expect(leadInputFromRegistration(parsed).sourceService).toBe('auth-microservice');
  });

  it('writes a factual message rather than inventing one the person never sent', () => {
    // `message` is required on Lead and this person wrote nothing — they registered. Putting
    // marketing copy or a fake enquiry here would make a lead look like an enquiry it never was.
    const { message } = leadInputFromRegistration(parsed);
    expect(message).toContain('Registrace');
    expect(message).not.toMatch(/mám zájem|poptávka/i);
  });

  it('carries the contact details the registration actually had', () => {
    const contacts = leadInputFromRegistration(parsed).contactMethods;
    expect(contacts).toEqual([{ type: 'email', value: 'someone@example.com', isPrimary: true }]);
  });

  it('creates no contact method when the registration had none', () => {
    const bare = parseRegistrationEvent(
      registration({ payload: { userId: 'u2', registrationMethod: 'oauth', registeredAt: 'x' } }),
    )!;
    expect(leadInputFromRegistration(bare).contactMethods).toEqual([]);
  });

  it('claims no marketing consent', () => {
    // Registering is not consent to be marketed at. Defaulting this to true would manufacture a
    // permission nobody gave.
    expect(leadInputFromRegistration(parsed).marketingConsent).toBeUndefined();
  });
});

describe('buildLeadCreatedEnvelope', () => {
  const envelope = () =>
    buildLeadCreatedEnvelope({
      leadId: 'lead-1',
      userId: 'user-1',
      correlationId: 'corr-from-landing',
      workspaceId: 'bazos',
      now: new Date('2026-07-22T10:00:05.000Z'),
      eventId: 'bbbbbbbb-0000-4000-8000-000000000001',
    });

  it('builds the envelope C-005 §2.3 pins', () => {
    expect(envelope()).toMatchObject({
      eventType: LEAD_CREATED_FROM_REGISTRATION,
      eventVersion: 1,
      producer: 'leads-microservice',
      dataClass: 'personal',
      workspaceId: 'bazos',
      payload: {
        leadId: 'lead-1',
        userId: 'user-1',
        correlationId: 'corr-from-landing',
        sourceService: 'auth-microservice',
      },
    });
  });

  it('carries the correlationId onward, so a lead can still reach its touchpoint', () => {
    expect(envelope().payload.correlationId).toBe('corr-from-landing');
  });

  it('omits the correlationId when the registration had none', () => {
    const direct = buildLeadCreatedEnvelope({
      leadId: 'lead-2',
      userId: 'user-2',
      workspaceId: 'bazos',
      now: new Date('2026-07-22T10:00:05.000Z'),
      eventId: 'cccccccc-0000-4000-8000-000000000001',
    });
    expect(direct.payload).not.toHaveProperty('correlationId');
  });

  it('carries no email, phone or name', () => {
    // The lead holds the contact details; the event holds a reference to it. Copying personal
    // data into an event duplicates it into every queue, log and consumer downstream.
    expect(Object.keys(envelope().payload).sort()).toEqual(
      ['correlationId', 'createdAt', 'leadId', 'sourceService', 'userId'].sort(),
    );
  });
});
