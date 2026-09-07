import { SetMetadata } from '@nestjs/common';

export const LEADS_INTERNAL_ROLES_KEY = 'leads:internal-roles';

/**
 * Declares which Auth roles may call an InternalServiceGuard route.
 *
 * Seed / mint via auth-microservice/scripts/provision-service-token.js:
 *   - internal:leads-microservice:read
 *   - internal:leads-microservice:write
 *   - internal:leads-microservice:service  (accepted on read+write routes)
 *
 * A guarded handler without this decorator is denied (fail closed).
 */
export const Roles = (...roles: string[]) =>
  SetMetadata(LEADS_INTERNAL_ROLES_KEY, roles);
