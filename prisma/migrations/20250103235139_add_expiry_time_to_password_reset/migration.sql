-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "expiry_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
