import { QualificationService } from './qualification.service';

/**
 * The behaviour that decides whether "cost per qualified lead" means anything: a judgement is
 * stored before it is announced, a correction appends rather than overwrites, and a broker outage
 * costs the announcement rather than the judgement.
 */

function build(options: { lead?: { id: string } | null; publishFails?: boolean } = {}) {
  const rows: any[] = [];
  const published: Array<{ exchange: string; routingKey: string; envelope: any }> = [];
  const updated: any[] = [];

  const prisma = {
    lead: {
      findFirst: jest.fn(async () => (options.lead === undefined ? { id: 'lead-1' } : options.lead)),
    },
    leadQualification: {
      create: jest.fn(async (args: any) => {
        const row = { id: 'q-1', ...args.data };
        rows.push(row);
        return row;
      }),
      update: jest.fn(async (args: any) => {
        updated.push(args);
        return { id: args.where.id };
      }),
      findMany: jest.fn(async () => [...rows].reverse()),
    },
  };
  const logging = { log: jest.fn(async () => undefined) };
  const publish = jest.fn(async (exchange: string, routingKey: string, envelope: any) => {
    if (options.publishFails) throw new Error('broker down');
    published.push({ exchange, routingKey, envelope });
  });

  const service = new QualificationService(prisma as never, logging as never, publish);
  return { service, prisma, logging, publish, rows, published, updated };
}

const adminUser = { id: 'admin-7', email: 'owner@example.com', roles: ['leads.owner'], isGlobalAdmin: true, workspaceIds: [] };

describe('recording a judgement', () => {
  it('stores the judgement and announces it', async () => {
    const { service, rows, published } = build();

    const result = await service.record(
      'lead-1',
      { qualificationStatus: 'qualified', reason: 'Odpověděl na WhatsApp.' },
      adminUser as never,
    );

    expect(result.status).toBe('recorded');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      leadId: 'lead-1',
      qualificationStatus: 'qualified',
      criteriaVersion: 'v1-owner-manual',
      decidedByType: 'human',
      decidedById: 'admin-7',
      reason: 'Odpověděl na WhatsApp.',
    });

    expect(published).toHaveLength(1);
    expect(published[0].routingKey).toBe('growth.lead.qualification_recorded.v1');
    expect(published[0].exchange).toBe('leads.events');
    expect(published[0].envelope.payload.leadId).toBe('lead-1');
  });

  // The decider is the authenticated principal, never anything the caller sent.
  it('attributes the judgement to the authenticated admin, ignoring the body', async () => {
    const { service, rows, published } = build();

    await service.record(
      'lead-1',
      { qualificationStatus: 'qualified', reason: 'ok', decidedById: 'somebody-else' } as never,
      adminUser as never,
    );

    expect(rows[0].decidedById).toBe('admin-7');
    expect(published[0].envelope.payload.decidedById).toBe('admin-7');
  });

  it('rejects an invalid judgement without storing anything', async () => {
    const { service, rows, published } = build();

    const result = await service.record('lead-1', { qualificationStatus: 'pending', reason: 'x' } as never, adminUser as never);

    expect(result.status).toBe('invalid');
    expect(rows).toHaveLength(0);
    expect(published).toHaveLength(0);
  });

  it('rejects a blank reason without storing anything', async () => {
    const { service, rows } = build();

    const result = await service.record('lead-1', { qualificationStatus: 'qualified', reason: '  ' } as never, adminUser as never);

    expect(result.status).toBe('invalid');
    expect(rows).toHaveLength(0);
  });

  // Scoped by the admin's workspace, like every other admin read. A judgement about a lead the
  // operator cannot see would be an authorisation hole opened from the write side.
  it('refuses a lead the admin cannot see', async () => {
    const { service, rows, published } = build({ lead: null });

    const result = await service.record(
      'lead-nope',
      { qualificationStatus: 'qualified', reason: 'ok' },
      adminUser as never,
    );

    expect(result.status).toBe('lead_not_found');
    expect(rows).toHaveLength(0);
    expect(published).toHaveLength(0);
  });
});

describe('a correction appends', () => {
  it('records a second judgement naming the one it supersedes, leaving the first intact', async () => {
    const { service, rows, published, prisma } = build();

    await service.record('lead-1', { qualificationStatus: 'qualified', reason: 'Odpověděl.' }, adminUser as never);
    await service.record(
      'lead-1',
      { qualificationStatus: 'disqualified', reason: 'Ukázalo se, že to byl spam.', supersedesQualificationId: 'q-1' },
      adminUser as never,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0].qualificationStatus).toBe('qualified');
    expect(rows[1].qualificationStatus).toBe('disqualified');
    expect(rows[1].supersedesQualificationId).toBe('q-1');
    expect(published[1].envelope.payload.supersedesQualificationId).toBe('q-1');

    // Nothing was rewritten. `update` is only ever used to stamp announcedAt.
    const statusUpdates = (prisma.leadQualification.update as jest.Mock).mock.calls.filter(
      ([args]: any) => args.data && 'qualificationStatus' in args.data,
    );
    expect(statusUpdates).toHaveLength(0);
  });
});

describe('a broker outage costs the announcement, not the judgement', () => {
  it('keeps the stored judgement and reports it as unannounced', async () => {
    const { service, rows, logging } = build({ publishFails: true });

    const result = await service.record(
      'lead-1',
      { qualificationStatus: 'qualified', reason: 'Odpověděl.' },
      adminUser as never,
    );

    // The owner's judgement is the scarce thing here — a human looked at a lead and decided. It
    // must survive a broker being down, and the caller must be told the announcement did not go.
    expect(result.status).toBe('recorded');
    expect((result as { announced: boolean }).announced).toBe(false);
    expect(rows).toHaveLength(1);
    expect(logging.log).toHaveBeenCalledWith('error', expect.stringContaining('not announced'), expect.anything());
  });

  it('stamps announcedAt only when the broker confirmed', async () => {
    const ok = build();
    await ok.service.record('lead-1', { qualificationStatus: 'qualified', reason: 'ok' }, adminUser as never);
    expect(ok.updated).toHaveLength(1);
    expect(ok.updated[0].data.announcedAt).toBeInstanceOf(Date);

    const down = build({ publishFails: true });
    await down.service.record('lead-1', { qualificationStatus: 'qualified', reason: 'ok' }, adminUser as never);
    expect(down.updated).toHaveLength(0);
  });
});

describe('history', () => {
  it('returns judgements newest first', async () => {
    const { service } = build();
    await service.record('lead-1', { qualificationStatus: 'qualified', reason: 'a' }, adminUser as never);
    await service.record('lead-1', { qualificationStatus: 'disqualified', reason: 'b' }, adminUser as never);

    const history = await service.history('lead-1', adminUser as never);
    expect(history.map((row: any) => row.reason)).toEqual(['b', 'a']);
  });

  it('refuses history for a lead the admin cannot see', async () => {
    const { service } = build({ lead: null });
    await expect(service.history('lead-nope', adminUser as never)).rejects.toThrow();
  });
});
