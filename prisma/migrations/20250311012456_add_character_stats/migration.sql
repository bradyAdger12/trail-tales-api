/*
  Warnings:

  - You are about to drop the `character` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "character" DROP CONSTRAINT "character_template_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "health" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "hunger" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "thirst" INTEGER NOT NULL DEFAULT 50;

-- DropTable
DROP TABLE "character";
