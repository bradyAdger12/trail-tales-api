/*
  Warnings:

  - You are about to drop the column `description` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `characters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "characters" DROP COLUMN "description",
DROP COLUMN "name";
