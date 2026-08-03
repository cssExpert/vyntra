-- AlterTable
ALTER TABLE "coupon_codes" ADD COLUMN     "customerGroupIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

