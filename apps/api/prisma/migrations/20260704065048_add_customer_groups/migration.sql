-- AlterTable
ALTER TABLE "store_customers" ADD COLUMN     "customerGroupId" TEXT;

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "categoriesMode" TEXT NOT NULL DEFAULT 'all',
    "productsMode" TEXT NOT NULL DEFAULT 'all',
    "pagesMode" TEXT NOT NULL DEFAULT 'all',
    "paymentMethodsMode" TEXT NOT NULL DEFAULT 'all',
    "shippingMethodsMode" TEXT NOT NULL DEFAULT 'all',
    "onlineGatewaysMode" TEXT NOT NULL DEFAULT 'all',
    "productPattern" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "minOrderValue" DOUBLE PRECISION,
    "maxOrderValue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_categories" (
    "id" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "customer_group_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_products" (
    "id" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "customer_group_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_pages" (
    "id" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,

    CONSTRAINT "customer_group_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_payment_methods" (
    "id" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "methodSlug" TEXT NOT NULL,

    CONSTRAINT "customer_group_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_shipping_methods" (
    "id" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "methodSlug" TEXT NOT NULL,

    CONSTRAINT "customer_group_shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_group_online_gateways" (
    "id" TEXT NOT NULL,
    "customerGroupId" TEXT NOT NULL,
    "gatewaySlug" TEXT NOT NULL,

    CONSTRAINT "customer_group_online_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tier_prices" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerGroupId" TEXT,
    "minQty" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_tier_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_groups_organizationId_idx" ON "customer_groups"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_groups_organizationId_name_key" ON "customer_groups"("organizationId", "name");

-- CreateIndex
CREATE INDEX "customer_group_categories_customerGroupId_idx" ON "customer_group_categories"("customerGroupId");

-- CreateIndex
CREATE INDEX "customer_group_categories_categoryId_idx" ON "customer_group_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_group_categories_customerGroupId_categoryId_key" ON "customer_group_categories"("customerGroupId", "categoryId");

-- CreateIndex
CREATE INDEX "customer_group_products_customerGroupId_idx" ON "customer_group_products"("customerGroupId");

-- CreateIndex
CREATE INDEX "customer_group_products_productId_idx" ON "customer_group_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_group_products_customerGroupId_productId_key" ON "customer_group_products"("customerGroupId", "productId");

-- CreateIndex
CREATE INDEX "customer_group_pages_customerGroupId_idx" ON "customer_group_pages"("customerGroupId");

-- CreateIndex
CREATE INDEX "customer_group_pages_pageId_idx" ON "customer_group_pages"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_group_pages_customerGroupId_pageId_key" ON "customer_group_pages"("customerGroupId", "pageId");

-- CreateIndex
CREATE INDEX "customer_group_payment_methods_customerGroupId_idx" ON "customer_group_payment_methods"("customerGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_group_payment_methods_customerGroupId_methodSlug_key" ON "customer_group_payment_methods"("customerGroupId", "methodSlug");

-- CreateIndex
CREATE INDEX "customer_group_shipping_methods_customerGroupId_idx" ON "customer_group_shipping_methods"("customerGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_group_shipping_methods_customerGroupId_methodSlug_key" ON "customer_group_shipping_methods"("customerGroupId", "methodSlug");

-- CreateIndex
CREATE INDEX "customer_group_online_gateways_customerGroupId_idx" ON "customer_group_online_gateways"("customerGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_group_online_gateways_customerGroupId_gatewaySlug_key" ON "customer_group_online_gateways"("customerGroupId", "gatewaySlug");

-- CreateIndex
CREATE INDEX "product_tier_prices_organizationId_idx" ON "product_tier_prices"("organizationId");

-- CreateIndex
CREATE INDEX "product_tier_prices_productId_idx" ON "product_tier_prices"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_tier_prices_productId_customerGroupId_minQty_key" ON "product_tier_prices"("productId", "customerGroupId", "minQty");

-- CreateIndex
CREATE INDEX "store_customers_customerGroupId_idx" ON "store_customers"("customerGroupId");

-- AddForeignKey
ALTER TABLE "store_customers" ADD CONSTRAINT "store_customers_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_categories" ADD CONSTRAINT "customer_group_categories_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_categories" ADD CONSTRAINT "customer_group_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_products" ADD CONSTRAINT "customer_group_products_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_products" ADD CONSTRAINT "customer_group_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_pages" ADD CONSTRAINT "customer_group_pages_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_pages" ADD CONSTRAINT "customer_group_pages_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_payment_methods" ADD CONSTRAINT "customer_group_payment_methods_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_shipping_methods" ADD CONSTRAINT "customer_group_shipping_methods_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_group_online_gateways" ADD CONSTRAINT "customer_group_online_gateways_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tier_prices" ADD CONSTRAINT "product_tier_prices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tier_prices" ADD CONSTRAINT "product_tier_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tier_prices" ADD CONSTRAINT "product_tier_prices_customerGroupId_fkey" FOREIGN KEY ("customerGroupId") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

