-- Rename type -> attributeType, add fieldType / usedInVariation / updatedAt
ALTER TABLE "store_attributes" RENAME COLUMN "type" TO "attributeType";
ALTER TABLE "store_attributes" ADD COLUMN IF NOT EXISTS "fieldType" TEXT NOT NULL DEFAULT 'dropdown';
ALTER TABLE "store_attributes" ADD COLUMN IF NOT EXISTS "usedInVariation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "store_attributes" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Rename value -> name, add colorHex
DROP INDEX IF EXISTS "store_attribute_values_attributeId_value_key";
ALTER TABLE "store_attribute_values" RENAME COLUMN "value" TO "name";
ALTER TABLE "store_attribute_values" ADD CONSTRAINT "store_attribute_values_attributeId_name_key" UNIQUE ("attributeId", "name");
ALTER TABLE "store_attribute_values" ADD COLUMN IF NOT EXISTS "colorHex" TEXT;
