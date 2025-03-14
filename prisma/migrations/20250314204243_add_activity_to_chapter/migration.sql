/*
  Warnings:

  - A unique constraint covering the columns `[activity_id]` on the table `chapters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `stories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chapters" ADD COLUMN     "activity_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "chapters_activity_id_key" ON "chapters"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "stories_user_id_key" ON "stories"("user_id");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
