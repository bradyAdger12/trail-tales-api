/*
  Warnings:

  - Added the required column `type` to the `matchup_entries` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `value` on the `matchup_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "matchup_entries" ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "value",
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;
