-- AlterTable
ALTER TABLE "academy_classes" ADD COLUMN     "recurrencePattern" TEXT,
ADD COLUMN     "scheduleType" TEXT NOT NULL DEFAULT 'ONE_TIME';
