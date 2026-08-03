-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "stripeEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePublishableKey" TEXT,
ADD COLUMN     "stripeSecretKey" TEXT,
ADD COLUMN     "stripeTestMode" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "stripeWebhookSecret" TEXT;

