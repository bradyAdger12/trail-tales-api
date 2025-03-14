/*
  Warnings:

  - You are about to drop the column `selected_action` on the `chapters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "actions" ADD COLUMN     "selected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "selected_action";
