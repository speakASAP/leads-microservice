import { RegistrationLeadService } from './registration-lead.service';

/**
 * The behaviour that decides whether the first experiment's numbers mean anything: one
 * registration produces exactly one lead, however many times the broker delivers it.
 */
const registration = (userId = 'user-1', correlationId?: string) => ({
  eventType: 'auth.user.registered.v1',
  eventVersion: 1,
  occurredAt: '2026-07-22T10:00:00.000Z',
  producer: 'auth-microservice',
  correlationId: 'envelope-trace',
  dataClass: 'personal',
  payload: {
    userId,
    correlationId,
    email: 'someone@example.com',
    registrationMethod: 'password',
    registeredAt: '2026-07-22T10:00:00.000Z',
  },
});

function build(options: { existing?: { id: string } | null; createFails?: unknown } = {}) {
  const created: unknown[] = [];
  const published: Array<{ exchange: string; routingKey: string; envelope: any }> = [];
  let existing = options.existing ?? null;

  const prisma = {
    lead: {
      findUnique: jest.fn(async () => existing),
      create: jest.fn(async (args: any) => {
        if (options.createFails) {
          // A real unique violation means somebody else won the race, so the row is there by the
          // time we look again. The mock has to behave the same way or the spec tests a database
          // that does not exist.
          if ((options.createFails as any)?.code === 'P2002') existing = { id: 'lead-winner' };
          throw options.createFails;
        }
        created.push(args.data);
        existing = { id: 'lead-1' };
        return { id: 'lead-1' };
      }),
    },
  };
  const logging = { log: jest.fn(async () => undefined) };
  const publish = jest.fn(async (exchange: string, routingKey: string, envelope: any) => {
    published.push({ exchange, routingKey, envelope });
  });

  const service = new RegistrationLeadService(prisma as never, logging as never, publish);
  return { service, prisma, logging, publish, created, published };
}

describe('one registration, one lead', () => {
  it('creates the lead and announces it', async () => {
    const { service, published, created } = build();

    await expect(service.handle(registration('user-1', 'corr-1'))).resolves.toEqual({
      status: 'created',
      leadId: 'lead-1',
    });

    expect((created[0] as any).authUserId).toBe('user-1');
    expect(published).toHaveLength(1);
    expect(published[0].exchange).toBe('leads.events');
    expect(published[0].routingKey).toBe('growth.lead.created_from_registration.v1');
    expect(published[0].envelope.payload).toMatchObject({ leadId: 'lead-1', userId: 'user-1', correlationId: 'corr-1' });
  });

  it('does not create a second lead when the same registration arrives again', async () => {
    // At-least-once delivery is the broker's contract. Without this, every redelivery is a second
    // person in the funnel and the conversion rate is quietly inflated.
    const { service, prisma, published } = build({ existing: { id: 'lead-existing' } });

    await expect(service.handle(registration())).resolves.toEqual({
      status: 'duplicate',
      leadId: 'lead-existing',
    });

    expect(prisma.lead.create).not.toHaveBeenCalled();
    expect(published).toHaveLength(0);
  });

  it('treats a lost race as a duplicate, not an error', async () => {
    // Two deliveries in flight: both read "no lead yet", one wins the insert. The constraint is
    // what actually decides, and the loser must not requeue forever over a lead that exists.
    const { service } = build({ createFails: Object.assign(new Error('unique'), { code: 'P2002' }) });

    await expect(service.handle(registration())).resolves.toEqual({
      status: 'duplicate',
      leadId: 'lead-winner',
    });
  });

  it('rethrows a real database failure so the message is retried', async () => {
    // A dropped connection is not a duplicate. Acking it would lose the lead silently.
    const { service } = build({ createFails: new Error('connection terminated') });

    await expect(service.handle(registration())).rejects.toThrow('connection terminated');
  });
});

describe('events that are not ours', () => {
  it.each([
    ['a different event type', { eventType: 'orders.order.created.v1', payload: { userId: 'u' } }],
    ['no userId', { eventType: 'auth.user.registered.v1', payload: {} }],
    ['junk', 'not an event'],
    ['nothing', null],
  ])('ignores %s without creating anything', async (_label, event) => {
    const { service, prisma, published } = build();

    await expect(service.handle(event)).resolves.toMatchObject({ status: 'ignored' });
    expect(prisma.lead.create).not.toHaveBeenCalled();
    expect(published).toHaveLength(0);
  });
});

describe('the lead survives a broker outage', () => {
  it('keeps the lead and logs enough to replay the announcement', async () => {
    // The lead is the durable thing. Rolling it back because an announcement failed would delete
    // a real person from the funnel to keep two systems tidy.
    const { service, logging } = build();
    const publish = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    });
    const withBrokenPublish = new RegistrationLeadService(
      (service as any).prisma,
      (service as any).logging,
      publish,
    );

    await expect(withBrokenPublish.handle(registration())).resolves.toMatchObject({ status: 'created' });
    expect(logging.log).toHaveBeenCalled();
  });

  it('still creates the lead when no publisher is configured at all', async () => {
    const { service } = build();
    const withoutPublisher = new RegistrationLeadService(
      (service as any).prisma,
      (service as any).logging,
    );

    await expect(withoutPublisher.handle(registration())).resolves.toMatchObject({ status: 'created' });
  });
});
