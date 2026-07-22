import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminLeadsController } from './admin-leads.controller';

function classGuards() {
  return Reflect.getMetadata(GUARDS_METADATA, AdminLeadsController) ?? [];
}

function buildController(
  leadsService: Record<string, unknown>,
  qualificationService: Record<string, unknown> = {},
) {
  const loggingService = { log: jest.fn().mockResolvedValue(undefined) };
  return {
    controller: new AdminLeadsController(
      leadsService as never,
      loggingService as never,
      qualificationService as never,
    ),
    loggingService,
    leadsService,
    qualificationService,
  };
}

const adminRequest = {
  adminUser: {
    id: 'auth_user_1',
    roles: ['leads.admin'],
    isGlobalAdmin: false,
    workspaceId: 'workspace-alpha',
    workspaceIds: ['workspace-alpha'],
  },
};

describe('AdminLeadsController access controls', () => {
  it('guards admin controller with Auth admin guard', () => {
    expect(classGuards()).toContain(AdminAuthGuard);
  });
});

describe('AdminLeadsController masked responses', () => {
  it('passes Auth admin scope into list service calls and logs only safe metadata', async () => {
    const { controller, loggingService, leadsService } = buildController({
      listAdminLeads: jest.fn().mockResolvedValue({
        items: [{ id: 'lead_admin_1', sourceHost: 'shop.example', contactMethods: [{ type: 'email', isPrimary: true }] }],
        page: 1,
        limit: 30,
        total: 1,
      }),
    });

    const result = await controller.listLeads({ limit: 30 }, adminRequest as never);

    expect((leadsService.listAdminLeads as jest.Mock)).toHaveBeenCalledWith({ limit: 30 }, adminRequest.adminUser);
    expect(result.items[0].contactMethods).toEqual([{ type: 'email', isPrimary: true }]);
    expect(loggingService.log).toHaveBeenCalledWith('info', 'Admin lead list retrieved', {
      page: 1,
      limit: 30,
      total: 1,
      workspaceId: 'workspace-alpha',
      globalAdmin: false,
    });
    const serialized = JSON.stringify(result) + JSON.stringify(loggingService.log.mock.calls);
    expect(serialized).not.toContain('person@example.test');
    expect(serialized).not.toContain('Synthetic raw product interest message');
    expect(serialized).not.toContain('synthetic-confirmation-token');
    expect(serialized).not.toContain('private/path');
  });
});

describe('AdminLeadsController qualification endpoint (S6)', () => {
  const recorded = { status: 'recorded', qualificationId: 'q-1', announced: true };

  it('is covered by the same admin guard as the rest of the controller', () => {
    // The marking surface writes a judgement about a person. It inherits the class-level guard
    // rather than declaring its own, so it cannot be left unguarded by omission.
    expect(classGuards()).toContain(AdminAuthGuard);
  });

  it('records a judgement and passes the authenticated admin through', async () => {
    const record = jest.fn().mockResolvedValue(recorded);
    const { controller } = buildController({}, { record });

    const result = await controller.recordQualification(
      'lead-1',
      { qualificationStatus: 'qualified', reason: 'Odpověděl na WhatsApp.' },
      adminRequest as never,
    );

    expect(record).toHaveBeenCalledWith(
      'lead-1',
      { qualificationStatus: 'qualified', reason: 'Odpověděl na WhatsApp.' },
      adminRequest.adminUser,
    );
    expect(result).toEqual({ qualificationId: 'q-1', announced: true });
  });

  it('turns an invalid judgement into a 400', async () => {
    const { controller } = buildController({}, { record: jest.fn().mockResolvedValue({ status: 'invalid' }) });

    await expect(
      controller.recordQualification('lead-1', { qualificationStatus: 'pending' }, adminRequest as never),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('turns an out-of-scope lead into a 404, not a 403', async () => {
    const { controller } = buildController({}, { record: jest.fn().mockResolvedValue({ status: 'lead_not_found' }) });

    // A 403 would confirm the lead exists somewhere, which tells an operator about leads in
    // workspaces they cannot see. 404 for both cases is the point.
    await expect(
      controller.recordQualification('lead-x', { qualificationStatus: 'qualified', reason: 'x' }, adminRequest as never),
    ).rejects.toMatchObject({ status: 404 });
  });

  // The reason is free text a human wrote about a person. It belongs in the row, not in every
  // log sink the platform ships to.
  it('never logs the reason text', async () => {
    const { controller, loggingService } = buildController({}, { record: jest.fn().mockResolvedValue(recorded) });

    await controller.recordQualification(
      'lead-1',
      { qualificationStatus: 'disqualified', reason: 'Uvedl cizí telefonní číslo, nereagoval.' },
      adminRequest as never,
    );

    expect(JSON.stringify(loggingService.log.mock.calls)).not.toContain('cizí telefonní číslo');
  });

  it('returns the full history so a correction and the judgement it replaced are both visible', async () => {
    const items = [
      { id: 'q-2', qualificationStatus: 'disqualified', supersedesQualificationId: 'q-1' },
      { id: 'q-1', qualificationStatus: 'qualified', supersedesQualificationId: null },
    ];
    const { controller } = buildController({}, { history: jest.fn().mockResolvedValue(items) });

    await expect(controller.getQualificationHistory('lead-1', adminRequest as never)).resolves.toEqual({ items });
  });
});
