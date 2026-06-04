-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Vyntra',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@vyntra.com',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#8b5cf6',
    "accentColor" TEXT NOT NULL DEFAULT '#ec4899',
    "maxOrganizations" INTEGER NOT NULL DEFAULT 1000,
    "maxUsersPerOrganization" INTEGER NOT NULL DEFAULT 500,
    "enableRegistration" BOOLEAN NOT NULL DEFAULT true,
    "enableSocialAuth" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);
