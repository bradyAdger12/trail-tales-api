-- DropForeignKey
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_activity_id_fkey";

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
