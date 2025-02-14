-- DropForeignKey
ALTER TABLE "matchup_entries" DROP CONSTRAINT "matchup_entries_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "matchup_entries" DROP CONSTRAINT "matchup_entries_matchup_id_fkey";

-- DropForeignKey
ALTER TABLE "matchup_entries" DROP CONSTRAINT "matchup_entries_user_id_fkey";

-- AddForeignKey
ALTER TABLE "matchup_entries" ADD CONSTRAINT "matchup_entries_matchup_id_fkey" FOREIGN KEY ("matchup_id") REFERENCES "matchups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchup_entries" ADD CONSTRAINT "matchup_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchup_entries" ADD CONSTRAINT "matchup_entries_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
