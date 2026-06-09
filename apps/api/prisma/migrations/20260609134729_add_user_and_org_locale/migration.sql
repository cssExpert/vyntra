-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "defaultLocale" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "locale" TEXT;
