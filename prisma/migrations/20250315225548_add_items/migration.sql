/*
  Warnings:

  - You are about to drop the column `chapter_id` on the `activities` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ItemBenefit" AS ENUM ('health', 'distance');

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "chapter_id";

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefit" "ItemBenefit" NOT NULL,
    "value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
