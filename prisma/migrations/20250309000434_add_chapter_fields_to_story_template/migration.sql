/*
  Warnings:

  - Added the required column `cover_image_url` to the `story_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_chapter_choices` to the `story_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_chapter_description` to the `story_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_chapter_title` to the `story_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "story_templates" ADD COLUMN     "cover_image_url" TEXT NOT NULL,
ADD COLUMN     "first_chapter_choices" JSONB NOT NULL,
ADD COLUMN     "first_chapter_description" TEXT NOT NULL,
ADD COLUMN     "first_chapter_title" TEXT NOT NULL;
