-- Persist employer review outcomes for joint declarations and exit requests.
ALTER TABLE "Membership"
  ADD COLUMN "joinRejectedAt" TIMESTAMP(3),
  ADD COLUMN "joinRejectionReason" TEXT,
  ADD COLUMN "exitDisputedAt" TIMESTAMP(3),
  ADD COLUMN "exitDisputeReason" TEXT;
