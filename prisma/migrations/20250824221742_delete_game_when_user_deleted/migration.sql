-- DropForeignKey
ALTER TABLE "games" DROP CONSTRAINT "games_user_id_fkey";

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
