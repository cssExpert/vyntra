-- Add submit button config (label/color/align/icon/iconPosition) to CMS forms
ALTER TABLE "cms_forms" ADD COLUMN "submitButton" JSONB;
