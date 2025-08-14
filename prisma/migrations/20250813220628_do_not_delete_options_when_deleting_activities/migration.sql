-- DropForeignKey
ALTER TABLE "survival_day_options" DROP CONSTRAINT "survival_day_options_activity_id_fkey";

-- AddForeignKey
ALTER TABLE "survival_day_options" ADD CONSTRAINT "survival_day_options_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
