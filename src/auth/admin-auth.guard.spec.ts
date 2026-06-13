import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AdminAuthGuard } from './admin-auth.guard';

function context(headers: Record<string, string>) {
  const request: Record<string, unknown> = { headers };
  return {
    request,
    executionContext: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as any,
  };
}

describe('AdminAuthGuard', () => {
  it('validates Auth bearer token and accepts Leads admin roles', async () => {
    const httpService = {
      post: jest.fn().mockReturnValue(of({ data: { valid: true, user: { id: 'auth_user_1', email: 'admin@example.test', roles: ['leads.admin'] } } })),
    };
    const guard = new AdminAuthGuard(httpService as never);
    const { request, executionContext } = context({ authorization: 'Bearer synthetic-token' });

    await expect(guard.canActivate(executionContext)).resolves.toBe(true);
    expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining('/auth/validate'), { token: 'synthetic-token' });
    expect(request.adminUser).toEqual({ id: 'auth_user_1', email: 'admin@example.test', roles: ['leads.admin'] });
  });

  it('rejects missing bearer token', async () => {
    const guard = new AdminAuthGuard({ post: jest.fn() } as never);
    await expect(guard.canActivate(context({}).executionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects Auth validation failures without logging token values', async () => {
    const guard = new AdminAuthGuard({ post: jest.fn().mockReturnValue(throwError(() => new Error('auth down'))) } as never);
    await expect(guard.canActivate(context({ authorization: 'Bearer synthetic-token' }).executionContext)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects authenticated users without Leads admin roles', async () => {
    const httpService = { post: jest.fn().mockReturnValue(of({ data: { valid: true, user: { id: 'auth_user_2', roles: ['app:other:admin'] } } })) };
    const guard = new AdminAuthGuard(httpService as never);
    await expect(guard.canActivate(context({ authorization: 'Bearer synthetic-token' }).executionContext)).rejects.toThrow(ForbiddenException);
  });
});
