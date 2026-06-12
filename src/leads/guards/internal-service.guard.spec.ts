import { UnauthorizedException } from '@nestjs/common';
import { InternalServiceGuard } from './internal-service.guard';

function mockContext(headers: Record<string, string>) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers }),
    }),
  } as any;
}

describe('InternalServiceGuard', () => {
  const originalToken = process.env.INTERNAL_SERVICE_TOKEN;
  const originalTrusted = process.env.TRUSTED_INTERNAL_SERVICES;

  afterEach(() => {
    process.env.INTERNAL_SERVICE_TOKEN = originalToken;
    process.env.TRUSTED_INTERNAL_SERVICES = originalTrusted;
  });

  it('allows trusted service with valid token', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'secret';
    process.env.TRUSTED_INTERNAL_SERVICES = 'marketing-microservice';
    const guard = new InternalServiceGuard();

    const allowed = guard.canActivate(
      mockContext({
        'x-internal-service-token': 'secret',
        'x-service-name': 'marketing-microservice',
      }),
    );

    expect(allowed).toBe(true);
  });

  it('rejects untrusted service', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'secret';
    process.env.TRUSTED_INTERNAL_SERVICES = 'marketing-microservice';
    const guard = new InternalServiceGuard();

    expect(() =>
      guard.canActivate(
        mockContext({
          'x-internal-service-token': 'secret',
          'x-service-name': 'unknown-service',
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects missing internal service token', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'secret';
    process.env.TRUSTED_INTERNAL_SERVICES = 'marketing-microservice';
    const guard = new InternalServiceGuard();

    expect(() =>
      guard.canActivate(
        mockContext({
          'x-service-name': 'marketing-microservice',
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('rejects missing service name when trusted services are configured', () => {
    process.env.INTERNAL_SERVICE_TOKEN = 'secret';
    process.env.TRUSTED_INTERNAL_SERVICES = 'marketing-microservice';
    const guard = new InternalServiceGuard();

    expect(() =>
      guard.canActivate(
        mockContext({
          'x-internal-service-token': 'secret',
        }),
      ),
    ).toThrow(UnauthorizedException);
  });
});
