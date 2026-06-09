-- AlterTable
ALTER TABLE "admin_settings" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "timezone" TEXT;
