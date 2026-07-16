-- Comments become polymorphic (resourceType/resourceId), mirroring the
-- TagAssignment pattern, and gain threaded replies (parentId) and an
-- optional rating (for future product comments). Existing rows are
-- backfilled from their old pageId/blogId columns before those are dropped.

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_pageId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_blogId_fkey";

-- AlterTable: add new columns (nullable for now, to allow backfill)
ALTER TABLE "comments"
  ADD COLUMN "resourceType" TEXT,
  ADD COLUMN "resourceId" TEXT,
  ADD COLUMN "parentId" TEXT,
  ADD COLUMN "rating" INTEGER;

-- Backfill existing rows from the old polymorphic-via-FK columns
UPDATE "comments" SET "resourceType" = 'page', "resourceId" = "pageId" WHERE "pageId" IS NOT NULL;
UPDATE "comments" SET "resourceType" = 'blog', "resourceId" = "blogId" WHERE "blogId" IS NOT NULL;

-- AlterTable: now that every row is backfilled, enforce NOT NULL
ALTER TABLE "comments"
  ALTER COLUMN "resourceType" SET NOT NULL,
  ALTER COLUMN "resourceId" SET NOT NULL;

-- AlterTable: drop the old FK-based columns
ALTER TABLE "comments" DROP COLUMN "pageId";
ALTER TABLE "comments" DROP COLUMN "blogId";

-- CreateIndex
CREATE INDEX "comments_resourceType_resourceId_idx" ON "comments"("resourceType", "resourceId");

-- AddForeignKey (self-relation for threaded replies)
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
