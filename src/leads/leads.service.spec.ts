import { LeadsService } from './leads.service';

function createService() {
  const prisma = {
    lead: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };

  return {
    prisma,
    service: new LeadsService(prisma as any),
  };
}

describe('LeadsService list bounds', () => {
  it('clamps list retrieval to 30 items', async () => {
    const { prisma, service } = createService();

    const result = await service.listLeads({ page: 2, limit: 500 });

    expect(result.limit).toBe(30);
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 30,
        take: 30,
      }),
    );
  });

  it('uses the default max page size when limit is omitted', async () => {
    const { prisma, service } = createService();

    const result = await service.listLeads({});

    expect(result.limit).toBe(30);
    expect(result.page).toBe(1);
    expect(prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 30,
      }),
    );
  });
});
