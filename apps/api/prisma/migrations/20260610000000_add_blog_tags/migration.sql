-- CreateTable
CREATE TABLE "blog_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_tags_organizationId_idx" ON "blog_tags"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_organizationId_slug_key" ON "blog_tags"("organizationId", "slug");

-- AddForeignKey
ALTER TABLE "blog_tags" ADD CONSTRAINT "blog_tags_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
