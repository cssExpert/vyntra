-- AlterTable: add module, provider, uploadedById, updatedAt to media
ALTER TABLE "media" ADD COLUMN "module" TEXT NOT NULL DEFAULT 'cms';
ALTER TABLE "media" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'local';
ALTER TABLE "media" ADD COLUMN "uploadedById" TEXT;
ALTER TABLE "media" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "media_organizationId_module_idx" ON "media"("organizationId", "module");
