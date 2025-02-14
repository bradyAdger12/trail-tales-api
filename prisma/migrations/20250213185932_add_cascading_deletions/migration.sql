-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_user_id_fkey";

-- DropForeignKey
ALTER TABLE "matchups" DROP CONSTRAINT "matchups_squad_one_id_fkey";

-- DropForeignKey
ALTER TABLE "matchups" DROP CONSTRAINT "matchups_squad_two_id_fkey";

-- DropForeignKey
ALTER TABLE "squad_members" DROP CONSTRAINT "squad_members_squad_id_fkey";

-- DropForeignKey
ALTER TABLE "squad_members" DROP CONSTRAINT "squad_members_user_id_fkey";

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_squad_one_id_fkey" FOREIGN KEY ("squad_one_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_squad_two_id_fkey" FOREIGN KEY ("squad_two_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
