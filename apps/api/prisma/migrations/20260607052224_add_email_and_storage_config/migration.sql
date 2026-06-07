-- AlterTable
ALTER TABLE "admin_settings" ADD COLUMN     "emailProvider" TEXT DEFAULT 'smtp',
ADD COLUMN     "mailgunConfig" JSONB,
ADD COLUMN     "s3Config" JSONB,
ADD COLUMN     "sendgridConfig" JSONB,
ADD COLUMN     "smtpConfig" JSONB,
ADD COLUMN     "storageProvider" TEXT DEFAULT 'local',
ADD COLUMN     "uploadthingConfig" JSONB,
ADD COLUMN     "vercelBlobConfig" JSONB;
