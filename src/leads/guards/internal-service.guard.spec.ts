import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InternalServiceGuard } from './internal-service.guard';
import { LEADS_INTERNAL_ROLES_KEY } from './roles.decorator';

describe('InternalServiceGuard', () => {
  const originalFetch = globalThis.fetch;
  let requiredRoles: string[] | undefined;
  let guard: InternalServiceGuard;

  function mockContext(headers: Record<string, string>) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
      getHandler: () => ({ name: 'getLead' }),
      getClass: () => ({ name: 'LeadsController' }),
    } as any;
  }

  beforeEach(() => {
    requiredRoles = ['internal:leads-microservice:read'];
    const reflector = {
      getAllAndOverride: jest.fn(() => requiredRoles),
    } as unknown as Reflector;
    guard = new InternalServiceGuard(reflector);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('allows a Bearer principal holding a required role', async () => {
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        valid: true,
        user: { id: 'svc-1', roles: ['internal:leads-microservice:read'] },
      }),
    })) as never;

    await expect(
      guard.canActivate(mockContext({ authorization: 'Bearer rs256-token' })),
    ).resolves.toBe(true);
  });

  it('accepts service role when listed on the route', async () => {
    requiredRoles = ['internal:leads-microservice:write', 'internal:leads-microservice:service'];
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        valid: true,
        user: { id: 'svc-1', roles: ['internal:leads-microservice:service'] },
      }),
    })) as never;

    await expect(
      guard.canActivate(mockContext({ authorization: 'Bearer rs256-token' })),
    ).resolves.toBe(true);
  });

  it('rejects a valid principal that lacks the required role', async () => {
    requiredRoles = ['internal:leads-microservice:write'];
    globalThis.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        valid: true,
        user: { id: 'svc-1', roles: ['internal:leads-microservice:read'] },
      }),
    })) as never;

    await expect(
      guard.canActivate(mockContext({ authorization: 'Bearer rs256-token' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects missing Authorization Bearer', async () => {
    await expect(
      guard.canActivate(mockContext({ 'x-internal-service-token': 'static' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('never accepts static x-internal-service-token as identity', async () => {
    globalThis.fetch = jest.fn(async () => ({ ok: false })) as never;

    await expect(
      guard.canActivate(
        mockContext({
          authorization: 'Bearer static-shared-secret',
          'x-internal-service-token': 'static-shared-secret',
          'x-service-name': 'marketing-microservice',
        }),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('denies and logs when the route has no @Roles policy', async () => {
    requiredRoles = undefined;
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      guard.canActivate(mockContext({ authorization: 'Bearer anything' })),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('fails closed when Auth validate is unreachable', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    }) as never;

    await expect(
      guard.canActivate(mockContext({ authorization: 'Bearer rs256-token' })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('LEADS_INTERNAL_ROLES_KEY', () => {
  it('exports a stable metadata key for @Roles', () => {
    expect(LEADS_INTERNAL_ROLES_KEY).toBe('leads:internal-roles');
  });
});
