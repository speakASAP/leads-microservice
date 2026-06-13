import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { AdminAuthGuard } from '../auth/admin-auth.guard';
import { AdminLeadsController } from './admin-leads.controller';

function classGuards() {
  return Reflect.getMetadata(GUARDS_METADATA, AdminLeadsController) ?? [];
}

function buildController(leadsService: Record<string, unknown>) {
  const loggingService = { log: jest.fn().mockResolvedValue(undefined) };
  return { controller: new AdminLeadsController(leadsService as never, loggingService as never), loggingService, leadsService };
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
