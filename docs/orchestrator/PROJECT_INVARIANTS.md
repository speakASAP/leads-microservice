# Leads Project Invariants

```yaml
id: LEADS-PROJECT-INVARIANTS
status: approved
owner: leads-owner
created: 2026-06-12
last_updated: 2026-06-12
completeness_level: complete
upstream:
  - INTENT.md
  - ../../BUSINESS.md
  - ../../SYSTEM.md
downstream:
  - PRE_CODING_GATE.md
  - EXECUTION_PLAN.md
  - READINESS_GATES.md
```

## Invariants

### LEADS-INV-001: Lead Intake Ownership

Leads owns non-registered lead intake records, contact methods, submitted messages, lead confirmation state, preferences, and unsubscribe state.

### LEADS-INV-002: Ecosystem Boundary

Auth owns registered-user identity and RBAC. Notifications owns delivery. Marketing owns campaign execution. Logging owns centralized log storage. Database-server owns infrastructure database operation.

### LEADS-INV-003: Consent Preservation

Lead work must preserve GDPR-relevant consent context. Changes must not drop, reinterpret, or fabricate `marketingConsent`, `consentSource`, `consentCapturedAt`, confirmation, or unsubscribe evidence.

### LEADS-INV-004: Raw Lead Data Protection

Raw lead messages, contact details, production lead rows, confirmation tokens, and private source URLs are sensitive. They must not appear in docs, prompts, tests, validation reports, console output, screenshots, or external AI/CRM payloads without explicit owner approval.

### LEADS-INV-005: No Mass Outreach Without Human Review

Leads must not trigger campaign sends, bulk notification loops, or automated outreach flows without explicit human review and a documented approval record.

### LEADS-INV-006: Bounded Public Intake

Public intake and query behavior must remain validated and bounded. The max 30 item limit must not be raised without owner approval and operational evidence.

### LEADS-INV-007: Internal Service Trust Boundary

Internal preference and unsubscribe APIs must require trusted service authentication. Header names, token behavior, and trusted service lists are contract-sensitive.

### LEADS-INV-008: Notification Boundary

Leads may request confirmation messages through notifications-microservice but must not own delivery mechanics, templates outside its local request context, or notification provider credentials.

### LEADS-INV-009: AI/CRM Export Approval

AI analysis or CRM integration must use minimized data by default. Raw lead export requires owner approval in the active task, including data fields, destination, retention, and validation evidence.

### LEADS-INV-010: Evidence And Continuation

Every implementation chunk must update status evidence and continuation state before the session ends.

## Required Evaluation

Every execution plan must list all affected invariants. If an invariant is not affected, state why. If an invariant is affected and the plan lacks validation evidence, block coding.
