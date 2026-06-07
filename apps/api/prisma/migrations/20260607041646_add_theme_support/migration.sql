-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "activeThemeId" TEXT;

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "isLandingPage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "layoutId" TEXT;

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "orgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layouts" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "navMenuId" TEXT,
    "footerColumns" JSONB NOT NULL DEFAULT '[]',
    "headerVariant" TEXT NOT NULL DEFAULT 'minimal',
    "footerVariant" TEXT NOT NULL DEFAULT 'columns',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "menuType" TEXT NOT NULL DEFAULT 'navigation',
    "slug" TEXT NOT NULL,
    "visibility" TEXT[] DEFAULT ARRAY['all']::TEXT[],
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT '_self',
    "visibility" TEXT[] DEFAULT ARRAY['all']::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "menuId" TEXT NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "themes_orgId_idx" ON "themes"("orgId");

-- CreateIndex
CREATE INDEX "themes_isGlobal_idx" ON "themes"("isGlobal");

-- CreateIndex
CREATE INDEX "layouts_organizationId_idx" ON "layouts"("organizationId");

-- CreateIndex
CREATE INDEX "menus_organizationId_idx" ON "menus"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "menus_organizationId_slug_key" ON "menus"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "menu_items_menuId_idx" ON "menu_items"("menuId");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_activeThemeId_fkey" FOREIGN KEY ("activeThemeId") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "themes" ADD CONSTRAINT "themes_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "layouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
