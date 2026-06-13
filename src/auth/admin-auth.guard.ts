import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export type AdminAuthUser = {
  id: string;
  email?: string | null;
  roles: string[];
};

const ACCEPTED_ADMIN_ROLES = new Set([
  'global:superadmin',
  'leads.owner',
  'leads.admin',
  'leads.sales_operator',
  'leads.marketing_operator',
  'leads.viewer',
  'app:leads:owner',
  'app:leads:admin',
  'app:leads:sales_operator',
  'app:leads:marketing_operator',
  'app:leads:viewer',
  'internal:leads:admin',
]);

function authValidateUrl() {
  const baseUrl = process.env.AUTH_SERVICE_URL || 'http://auth-microservice:3370';
  return baseUrl.replace(/\/$/, '') + '/auth/validate';
}

function extractBearerToken(header: unknown): string {
  const value = Array.isArray(header) ? header[0] : header;
  if (typeof value !== 'string' || !value.startsWith('Bearer ')) {
    throw new UnauthorizedException('Missing or invalid authorization header');
  }
  const token = value.slice('Bearer '.length).trim();
  if (!token) {
    throw new UnauthorizedException('Missing or invalid authorization header');
  }
  return token;
}

function rolesFromUser(user: Record<string, unknown>): string[] {
  return Array.isArray(user.roles) ? user.roles.filter((role): role is string => typeof role === 'string') : [];
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractBearerToken(request.headers.authorization);

    let user: Record<string, unknown>;
    try {
      const response = await firstValueFrom(this.httpService.post(authValidateUrl(), { token }));
      if (!response.data?.valid || !response.data?.user) {
        throw new UnauthorizedException('Invalid Auth token');
      }
      user = response.data.user as Record<string, unknown>;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Auth token');
    }

    const roles = rolesFromUser(user);
    const hasAcceptedRole = roles.some((role) => ACCEPTED_ADMIN_ROLES.has(role));
    if (!hasAcceptedRole) {
      throw new ForbiddenException('Insufficient Leads admin role');
    }

    const id = String(user.id || user.sub || '').trim();
    if (!id) {
      throw new UnauthorizedException('Invalid Auth user');
    }

    request.adminUser = {
      id,
      email: typeof user.email === 'string' ? user.email : null,
      roles,
    } as AdminAuthUser;
    return true;
  }
}
