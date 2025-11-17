-- AlterTable
ALTER TABLE "survival_day_options" ADD COLUMN     "activity_id" TEXT;

-- AddForeignKey
ALTER TABLE "survival_day_options" ADD CONSTRAINT "survival_day_options_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
