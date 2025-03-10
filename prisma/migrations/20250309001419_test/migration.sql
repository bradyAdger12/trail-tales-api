/*
  Warnings:

  - You are about to drop the column `first_chapter_title` on the `story_templates` table. All the data in the column will be lost.
  - The `first_chapter_choices` column on the `story_templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "story_templates" DROP COLUMN "first_chapter_title",
DROP COLUMN "first_chapter_choices",
ADD COLUMN     "first_chapter_choices" JSONB[];
