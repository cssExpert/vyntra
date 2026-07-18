-- Add appearance/embed settings JSON to CMS forms
ALTER TABLE "cms_forms" ADD COLUMN "settings" JSONB;
