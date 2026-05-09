ALTER TABLE "Lead"
ADD COLUMN "confirmationToken" TEXT,
ADD COLUMN "confirmedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Lead_confirmationToken_key" ON "Lead"("confirmationToken");
