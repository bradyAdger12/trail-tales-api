/*
  Warnings:

  - Changed the type of `first_chapter_choices` on the `story_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "story_templates" DROP COLUMN "first_chapter_choices",
ADD COLUMN     "first_chapter_choices" JSONB NOT NULL;
