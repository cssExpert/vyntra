-- Add subdomain, custom domain, and domain verification fields to organizations
ALTER TABLE "organizations" ADD COLUMN "subdomain" TEXT;
ALTER TABLE "organizations" ADD COLUMN "customDomain" TEXT;
ALTER TABLE "organizations" ADD COLUMN "customDomainVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "organizations" ADD COLUMN "domainVerificationToken" TEXT;

-- Unique constraints
CREATE UNIQUE INDEX "organizations_subdomain_key" ON "organizations"("subdomain");
CREATE UNIQUE INDEX "organizations_customDomain_key" ON "organizations"("customDomain");
CREATE UNIQUE INDEX "organizations_domainVerificationToken_key" ON "organizations"("domainVerificationToken");
