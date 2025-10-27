-- AlterTable
ALTER TABLE "affiliate_commissions" ADD COLUMN     "referredUserId" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "relatedEntityId" TEXT,
ADD COLUMN     "relatedEntityType" TEXT,
ADD COLUMN     "requiresVerification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationData" JSONB,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- AlterTable
ALTER TABLE "affiliate_programs" ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "payoutDetails" JSONB,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referredByCode" TEXT;
