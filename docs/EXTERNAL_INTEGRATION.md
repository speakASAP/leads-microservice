# External Integration Guide

This document describes how external microservices should integrate with the
leads-microservice to submit new lead requests.

## Base URLs

Use one of the following, depending on where the caller runs:

- **Docker network (recommended)**: `http://leads-microservice:${PORT}`
- **Production HTTPS**: `https://<domain>` (from `DOMAIN` in `.env`)

## Rate Limits

- Max 30 items per request
- Do not increase timeouts; check logs for delays

## Required Headers

- `Content-Type: application/json`
- Optional: `X-Request-Id` for traceability
- Optional: `X-Service-Name` to identify the caller

## Lead Submission Endpoint

`POST /api/leads/submit`

### Request Body

```json
{
  "source": "statex.cz/contact",
  "message": "I need a prototype and estimate",
  "contactMethods": [
    { "type": "email", "value": "client@example.com" },
    { "type": "whatsapp", "value": "+420777111222" },
    { "type": "telegram", "value": "@client_handle" },
    { "type": "phone", "value": "+420777111333" },
    { "type": "linkedin", "value": "https://linkedin.com/in/client" }
  ],
  "metadata": {
    "page": "https://statex.cz/contact",
    "locale": "en"
  }
}
```

### Response (Success)

```json
{
  "leadId": "uuid",
  "status": "received",
  "confirmationSent": true
}
```

### Response (Error)

```json
{
  "error": "validation_error",
  "message": "message is required"
}
```

## Integration Notes

- Always send at least one `contactMethods` entry.
- Use existing shared microservices via env vars, not hardcoded URLs.
- All failures and retries should be logged through `LOGGING_SERVICE_URL`.
