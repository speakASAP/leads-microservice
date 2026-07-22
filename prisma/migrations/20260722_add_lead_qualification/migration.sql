-- S6 — manual lead qualification (C-006 §1).
--
-- Append-only by intent: the application never issues an UPDATE or a DELETE against this table.
-- A corrected judgement is a new row carrying "supersedesQualificationId", so the history of what
-- the owner thought about a lead, and when, stays readable.
--
-- Unlike growth-core's decision_artefact there is no trigger and no privilege split enforcing that
-- here: leads-microservice connects to its database as the owning role via Prisma, and a trigger a
-- table owner can DISABLE is a comment with extra steps. The guarantee is upheld by there being no
-- update path in the code, and by growth-core — which does hold the privilege split — being the
-- system of record for these judgements. Noted rather than glossed: this table is the weaker copy.

-- Types match the rest of this database: Lead.id and LeadContactMethod.leadId are UUID in
-- production, even though prisma/schema.prisma declares plain String with no @db.Uuid anywhere.
-- The schema and the database have drifted; Prisma casts, so nothing complained until a foreign
-- key demanded the two agree. Follow the database, not the schema file.
CREATE TABLE "LeadQualification" (
  "id"                        UUID         NOT NULL,
  "leadId"                    UUID         NOT NULL,
  "qualificationStatus"       TEXT         NOT NULL,
  "criteriaVersion"           TEXT         NOT NULL,
  "decidedByType"             TEXT         NOT NULL,
  "decidedById"               TEXT         NOT NULL,
  "decidedAt"                 TIMESTAMP(3) NOT NULL,
  "reason"                    TEXT         NOT NULL,
  "supersedesQualificationId" UUID,
  "announcedAt"               TIMESTAMP(3),
  "createdAt"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeadQualification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadQualification_leadId_decidedAt_idx" ON "LeadQualification"("leadId", "decidedAt");
CREATE INDEX "LeadQualification_decidedAt_idx" ON "LeadQualification"("decidedAt");

ALTER TABLE "LeadQualification"
  ADD CONSTRAINT "LeadQualification_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A judgement must say something. Blank free text is rejected, not defaulted: a defaulted reason
-- reads as complete in every list and carries nothing when someone later asks why a lead was
-- written off. Whitespace-only counts as blank.
ALTER TABLE "LeadQualification"
  ADD CONSTRAINT "LeadQualification_reason_not_blank"
  CHECK (length(btrim("reason")) > 0);

-- `pending` is deliberately not an accepted value — it is the absence of a row.
ALTER TABLE "LeadQualification"
  ADD CONSTRAINT "LeadQualification_status_known"
  CHECK ("qualificationStatus" IN ('qualified', 'disqualified'));
