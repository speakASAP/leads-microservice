CREATE TABLE "LeadLifecycleEvent" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "leadId" uuid NOT NULL,
  "eventId" text NOT NULL,
  "eventType" text NOT NULL,
  "eventVersion" integer NOT NULL,
  "occurredAt" timestamptz NOT NULL,
  "producer" text NOT NULL,
  "correlationId" text,
  "idempotencyKey" text,
  "dataClass" text NOT NULL,
  "payload" jsonb NOT NULL,
  "consumerRoutes" jsonb,
  "recordedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "LeadLifecycleEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadLifecycleEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "LeadLifecycleEvent_eventId_key" ON "LeadLifecycleEvent"("eventId");
CREATE UNIQUE INDEX "LeadLifecycleEvent_idempotencyKey_key" ON "LeadLifecycleEvent"("idempotencyKey");
CREATE INDEX "LeadLifecycleEvent_leadId_occurredAt_idx" ON "LeadLifecycleEvent"("leadId", "occurredAt");
CREATE INDEX "LeadLifecycleEvent_eventType_idx" ON "LeadLifecycleEvent"("eventType");
CREATE INDEX "LeadLifecycleEvent_recordedAt_idx" ON "LeadLifecycleEvent"("recordedAt");
