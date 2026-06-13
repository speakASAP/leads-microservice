# Goal 19 Context Package

Auth source of truth: auth-microservice docs/UNIFIED_AUTH_CONTRACT.md and docs/CONSUMER_JWT_VALIDATION_STANDARD.md. Default consumer pattern is server-side POST /auth/validate with body token. Auth returns valid true and user with Auth-owned roles.

Leads current behavior: public /admin shell asks for internal service token and calls guarded service-to-service endpoints. This is temporary and inappropriate for human browser users.

Required behavior: browser/admin APIs use Authorization bearer access tokens, validate through Auth, enforce Leads roles, and return masked/minimized lead data.

Known follow-up: exact Auth tenant/workspace mapping is not defined, so tenant isolation remains blocked and must not be fabricated.
