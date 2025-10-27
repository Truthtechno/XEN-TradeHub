/*
  Warnings:

  - You are about to drop the column `traderId` on the `copy_trades` table. All the data in the column will be lost.
  - You are about to drop the column `traderId` on the `copy_trading_subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `traderId` on the `profit_shares` table. All the data in the column will be lost.
  - You are about to drop the `master_traders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `platformId` to the `copy_trades` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformId` to the `copy_trading_subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformId` to the `profit_shares` table without a default value. This is not possible if the table is not empty.
*/

-- Step 1: Create the new copy_trading_platforms table
CREATE TABLE "copy_trading_platforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "copyTradingLink" TEXT NOT NULL,
    "profitPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitShareRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "riskLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "minInvestment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "strategy" TEXT,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDrawdown" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "copy_trading_platforms_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "copy_trading_platforms_slug_key" ON "copy_trading_platforms"("slug");

-- Step 2: Migrate data from master_traders to copy_trading_platforms
INSERT INTO "copy_trading_platforms" (
    "id", "name", "slug", "description", "logoUrl", "copyTradingLink",
    "profitPercentage", "profitShareRate", "riskLevel", "minInvestment",
    "strategy", "roi", "winRate", "maxDrawdown", "isActive", "displayOrder",
    "notes", "createdAt", "updatedAt"
)
SELECT 
    "id", "name", "slug", "description", "avatarUrl", 
    COALESCE("copyLink", 'https://platform.com/copy/' || "slug"),
    "profitPercentage", "profitShareRate", "riskLevel", "minInvestment",
    "strategy", "roi", "winRate", "maxDrawdown", "isActive", "displayOrder",
    "bio", "createdAt", "updatedAt"
FROM "master_traders";

-- Step 3: Add platformId columns with data migration
ALTER TABLE "copy_trading_subscriptions" ADD COLUMN "platformId" TEXT;
UPDATE "copy_trading_subscriptions" SET "platformId" = "traderId";
ALTER TABLE "copy_trading_subscriptions" ALTER COLUMN "platformId" SET NOT NULL;

ALTER TABLE "copy_trades" ADD COLUMN "platformId" TEXT;
UPDATE "copy_trades" SET "platformId" = "traderId";
ALTER TABLE "copy_trades" ALTER COLUMN "platformId" SET NOT NULL;

ALTER TABLE "profit_shares" ADD COLUMN "platformId" TEXT;
UPDATE "profit_shares" SET "platformId" = "traderId";
ALTER TABLE "profit_shares" ALTER COLUMN "platformId" SET NOT NULL;

-- Step 4: Drop old foreign keys
ALTER TABLE "copy_trades" DROP CONSTRAINT IF EXISTS "copy_trades_traderId_fkey";
ALTER TABLE "copy_trading_subscriptions" DROP CONSTRAINT IF EXISTS "copy_trading_subscriptions_traderId_fkey";
ALTER TABLE "profit_shares" DROP CONSTRAINT IF EXISTS "profit_shares_traderId_fkey";

-- Step 5: Drop old traderId columns
ALTER TABLE "copy_trades" DROP COLUMN "traderId";
ALTER TABLE "copy_trading_subscriptions" DROP COLUMN "traderId";
ALTER TABLE "profit_shares" DROP COLUMN "traderId";

-- Step 6: Add new foreign keys
ALTER TABLE "copy_trading_subscriptions" ADD CONSTRAINT "copy_trading_subscriptions_platformId_fkey" 
    FOREIGN KEY ("platformId") REFERENCES "copy_trading_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_platformId_fkey" 
    FOREIGN KEY ("platformId") REFERENCES "copy_trading_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "profit_shares" ADD CONSTRAINT "profit_shares_platformId_fkey" 
    FOREIGN KEY ("platformId") REFERENCES "copy_trading_platforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Drop the old master_traders table
DROP TABLE "master_traders";
