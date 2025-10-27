-- CreateTable
CREATE TABLE "monthly_challenges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "referralCount" INTEGER NOT NULL DEFAULT 0,
    "qualifiedReferrals" TEXT[],
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_challenges_userId_month_key" ON "monthly_challenges"("userId", "month");

-- AddForeignKey
ALTER TABLE "monthly_challenges" ADD CONSTRAINT "monthly_challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
