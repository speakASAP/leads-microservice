CREATE TABLE "LeadMarketingApprovalEvidence" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "leadId" uuid NOT NULL,
  "idempotencyKey" text NOT NULL,
  "approvalId" text NOT NULL,
  "campaignId" text NOT NULL,
  "approvedAt" timestamptz NOT NULL,
  "purposeCode" text NOT NULL,
  "channel" text NOT NULL,
  "audienceCount" integer NOT NULL,
  "eligibleCount" integer NOT NULL,
  "retentionExpectation" text NOT NULL,
  "humanApprovalReferencePresent" boolean NOT NULL DEFAULT false,
  "approvedByPresent" boolean NOT NULL DEFAULT false,
  "workspaceIdPresent" boolean NOT NULL DEFAULT false,
  "contentVersionPresent" boolean NOT NULL DEFAULT false,
  "eligibilityEligible" boolean NOT NULL,
  "eligibilityReasons" jsonb,
  "returnedContactMethodCount" integer NOT NULL DEFAULT 0,
  "recordedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "LeadMarketingApprovalEvidence_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadMarketingApprovalEvidence_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "LeadMarketingApprovalEvidence_idempotencyKey_key" ON "LeadMarketingApprovalEvidence"("idempotencyKey");
CREATE INDEX "LeadMarketingApprovalEvidence_leadId_recordedAt_idx" ON "LeadMarketingApprovalEvidence"("leadId", "recordedAt");
CREATE INDEX "LeadMarketingApprovalEvidence_approvalId_idx" ON "LeadMarketingApprovalEvidence"("approvalId");
CREATE INDEX "LeadMarketingApprovalEvidence_campaignId_idx" ON "LeadMarketingApprovalEvidence"("campaignId");
CREATE INDEX "LeadMarketingApprovalEvidence_recordedAt_idx" ON "LeadMarketingApprovalEvidence"("recordedAt");
