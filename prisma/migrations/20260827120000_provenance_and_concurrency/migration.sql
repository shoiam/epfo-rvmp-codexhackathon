-- Add provenance and concurrent-employment metadata without changing existing records.
CREATE TYPE "ProvenanceSource" AS ENUM ('HANDSHAKE', 'MIGRATED');
CREATE TYPE "VerificationStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'DISPUTED');

ALTER TABLE "Membership"
  ADD COLUMN "concurrentAcknowledgedAt" TIMESTAMP(3),
  ADD COLUMN "source" "ProvenanceSource" NOT NULL DEFAULT 'HANDSHAKE',
  ADD COLUMN "verification" "VerificationStatus" NOT NULL DEFAULT 'VERIFIED',
  ADD COLUMN "verificationRequestedAt" TIMESTAMP(3),
  ADD COLUMN "verificationConfirmedAt" TIMESTAMP(3);

ALTER TABLE "Contribution"
  ADD COLUMN "source" "ProvenanceSource" NOT NULL DEFAULT 'HANDSHAKE';
