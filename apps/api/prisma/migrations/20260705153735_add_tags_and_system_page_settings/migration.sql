-- DropForeignKey
ALTER TABLE "blog_tags" DROP CONSTRAINT "blog_tags_organizationId_fkey";

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "tags";

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "blogCommentsEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "blogFeaturedEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "blogPinToTopEnabled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" DROP COLUMN IF EXISTS "tags";

-- DropTable
DROP TABLE "blog_tags";

-- CreateTable
CREATE TABLE "system_page_settings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "pageType" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "metaKeywords" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogType" TEXT NOT NULL DEFAULT 'website',
    "ogUrl" TEXT,
    "ogImage" TEXT,
    "faviconUrl" TEXT,
    "customSettings" JSONB,
    "headScript" TEXT,
    "bodyScript" TEXT,
    "customCss" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_page_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_assignments" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_page_settings_organizationId_idx" ON "system_page_settings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "system_page_settings_organizationId_pageType_key" ON "system_page_settings"("organizationId", "pageType");

-- CreateIndex
CREATE INDEX "tags_organizationId_idx" ON "tags"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_organizationId_slug_key" ON "tags"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "tag_assignments_entityType_entityId_idx" ON "tag_assignments"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "tag_assignments_organizationId_idx" ON "tag_assignments"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_assignments_tagId_entityType_entityId_key" ON "tag_assignments"("tagId", "entityType", "entityId");

-- AddForeignKey
ALTER TABLE "system_page_settings" ADD CONSTRAINT "system_page_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignments" ADD CONSTRAINT "tag_assignments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignments" ADD CONSTRAINT "tag_assignments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

