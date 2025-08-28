/*
  Warnings:

  - You are about to drop the `game_updates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."game_updates" DROP CONSTRAINT "game_updates_game_id_fkey";

-- DropTable
DROP TABLE "public"."game_updates";

-- CreateTable
CREATE TABLE "public"."game_notifications" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "resource" "public"."Resource" NOT NULL,
    "resource_change_as_percent" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."game_notifications" ADD CONSTRAINT "game_notifications_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
