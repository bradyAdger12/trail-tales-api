/*
  Warnings:

  - You are about to drop the column `number` on the `survival_days` table. All the data in the column will be lost.
  - Added the required column `day` to the `survival_days` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "survival_days" DROP COLUMN "number",
ADD COLUMN     "day" INTEGER NOT NULL;
