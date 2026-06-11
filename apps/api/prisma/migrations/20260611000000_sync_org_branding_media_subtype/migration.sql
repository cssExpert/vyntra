-- Sync drifted schema: media.category → media.subtype, org branding/i18n fields.
-- Guards make this safe on databases where prisma db push already applied the columns.

-- AlterTable
ALTER TABLE "media" DROP COLUMN IF EXISTS "category";
ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "subtype" TEXT;
ALTER TABLE "media" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "darkLogoUrl" TEXT;
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "defaultSiteLanguage" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "siteLanguages" TEXT[] DEFAULT ARRAY['en']::TEXT[];
ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "themeSwitcherEnabled" BOOLEAN NOT NULL DEFAULT false;
