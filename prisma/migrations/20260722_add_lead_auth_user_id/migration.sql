-- EP-005 W5 — leads created from an auth registration.
--
-- Nullable because every lead that already exists came from a form, not a registration, and most
-- future ones still will.
--
-- Unique because a person registers once. `auth.user.registered.v1` is delivered at least once,
-- and the same registration arriving twice must not produce two leads for the same human being —
-- letting the constraint decide removes the read-then-write window an application check would
-- leave open.
ALTER TABLE "Lead" ADD COLUMN "authUserId" TEXT;
CREATE UNIQUE INDEX "Lead_authUserId_key" ON "Lead"("authUserId");
