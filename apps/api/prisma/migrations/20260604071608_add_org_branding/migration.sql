-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "accentColor" TEXT NOT NULL DEFAULT '#ec4899',
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
ADD COLUMN     "secondaryColor" TEXT NOT NULL DEFAULT '#8b5cf6',
ADD COLUMN     "slackNotifications" BOOLEAN NOT NULL DEFAULT false;
