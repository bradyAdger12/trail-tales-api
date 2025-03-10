/*
  Warnings:

  - You are about to drop the column `first_chapter_choices` on the `story_templates` table. All the data in the column will be lost.
  - You are about to drop the column `first_chapter_description` on the `story_templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "story_templates" DROP COLUMN "first_chapter_choices",
DROP COLUMN "first_chapter_description";
