import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LEADS_INTERNAL_ROLES_KEY } from './roles.decorator';

type AuthValidateResponse = {
  valid?: boolean;
  user?: {
    id?: string;
    sub?: string;
    email?: string;
    roles?: unknown;
  };
};

/**
 * Auth RS256 gate for Leads internal / service-to-service routes.
 *
 * Shape mirrors auth-microservice InternalServiceOrRoleGuard (Bearer only,
 * named roles, fail closed) but validates remotely via POST /auth/validate so
 * this consumer never holds Auth signing material.
 *
 * Static INTERNAL_SERVICE_TOKEN / x-internal-service-token / x-service-name
 * acceptance is deleted — not flag-gated. Callers must present a per-pair
 * Auth-issued principal with an explicit @Roles policy on the route.
 *
 * Needed roles (seed if missing):
 *   internal:leads-microservice:read | write | service
 */
@Injectable()
export class InternalServiceGuard implements CanActivate {
  private readonly authServiceUrl = (
    process.env.AUTH_SERVICE_URL || 'http://auth-microservice:3370'
  ).replace(/\/+$/, '');
  private readonly authValidateTimeoutMs = Number(
    process.env.AUTH_VALIDATE_TIMEOUT_MS || 3000,
  );

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(LEADS_INTERNAL_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      const handlerName = `${context.getClass().name}.${context.getHandler().name}`;
      this.denyUndecorated(handlerName);
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers?.authorization;
    if (!authorization || typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const user = await this.validateBearer(token);
    const roles = Array.isArray(user.roles)
      ? user.roles.filter((role): role is string => typeof role === 'string')
      : [];

    if (!requiredRoles.some((role) => roles.includes(role))) {
      throw new ForbiddenException('Principal lacks the required role');
    }

    request.user = {
      id: user.id || user.sub,
      email: user.email,
      roles,
    };
    return true;
  }

  private denyUndecorated(handlerName: string): never {
    // eslint-disable-next-line no-console
    console.error(
      `[InternalServiceGuard] ${handlerName} is guarded but declares no @Roles; ` +
        'denying the request. Add an explicit role requirement to this handler.',
    );
    throw new ForbiddenException('Route has no declared role requirement');
  }

  private async validateBearer(token: string): Promise<NonNullable<AuthValidateResponse['user']>> {
    const controller = new AbortController();
    const timeoutMs =
      Number.isFinite(this.authValidateTimeoutMs) && this.authValidateTimeoutMs > 0
        ? this.authValidateTimeoutMs
        : 3000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.authServiceUrl}/auth/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'leads_internal_auth_validate_unreachable',
          message: 'Auth validate unreachable during internal route check',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error),
        }),
      );
      throw new UnauthorizedException('Invalid token');
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new UnauthorizedException('Invalid token');
    }

    let validation: AuthValidateResponse;
    try {
      validation = (await response.json()) as AuthValidateResponse;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!validation.valid || !validation.user) {
      throw new UnauthorizedException('Invalid token');
    }

    return validation.user;
  }
}
