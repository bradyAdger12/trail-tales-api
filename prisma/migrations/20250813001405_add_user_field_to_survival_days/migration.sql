/*
  Warnings:

  - Added the required column `user_id` to the `survival_days` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "survival_days" ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "survival_days" ADD CONSTRAINT "survival_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
