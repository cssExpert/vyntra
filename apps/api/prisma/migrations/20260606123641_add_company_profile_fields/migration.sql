-- AlterTable: company profile fields
ALTER TABLE "organizations" ADD COLUMN "legalName" TEXT;
ALTER TABLE "organizations" ADD COLUMN "industry" TEXT;
ALTER TABLE "organizations" ADD COLUMN "address" TEXT;
