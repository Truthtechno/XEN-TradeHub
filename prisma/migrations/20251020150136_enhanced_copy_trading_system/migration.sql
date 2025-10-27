/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `master_traders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `master_traders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "copy_trading_subscriptions" ADD COLUMN     "brokerAccountId" TEXT,
ADD COLUMN     "copyRatio" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "currentProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "losingTrades" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "stopLossPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "totalLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tradesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "winningTrades" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "master_traders" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "broker" TEXT,
ADD COLUMN     "maxDrawdown" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "profitShareRate" DOUBLE PRECISION NOT NULL DEFAULT 20,
ADD COLUMN     "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalTrades" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "copy_trades" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "symbol" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "lotSize" DOUBLE PRECISION NOT NULL,
    "profitLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "copy_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profit_shares" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "tradeProfit" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profit_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_traders_username_key" ON "master_traders"("username");

-- AddForeignKey
ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "master_traders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "copy_trading_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_shares" ADD CONSTRAINT "profit_shares_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "master_traders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profit_shares" ADD CONSTRAINT "profit_shares_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "copy_trading_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
