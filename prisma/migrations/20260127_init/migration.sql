-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "Lead" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "status" text NOT NULL DEFAULT 'new',
  "sourceService" text NOT NULL,
  "sourceUrl" text,
  "sourceLabel" text,
  "message" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadContactMethod" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "leadId" uuid NOT NULL,
  "type" text NOT NULL,
  "value" text NOT NULL,
  "isPrimary" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "LeadContactMethod_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadContactMethod_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE
);

CREATE TABLE "LeadSubmission" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "leadId" uuid NOT NULL,
  "payloadJson" jsonb NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "LeadSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadSubmission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE
);

CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_sourceService_idx" ON "Lead"("sourceService");
CREATE INDEX "LeadContactMethod_leadId_idx" ON "LeadContactMethod"("leadId");
CREATE INDEX "LeadSubmission_leadId_idx" ON "LeadSubmission"("leadId");
CREATE INDEX "LeadSubmission_createdAt_idx" ON "LeadSubmission"("createdAt");
