-- AlterTable
ALTER TABLE "store_customers" ADD COLUMN     "passwordResetExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT;

-- CreateIndex
CREATE INDEX "store_customers_passwordResetToken_idx" ON "store_customers"("passwordResetToken");

