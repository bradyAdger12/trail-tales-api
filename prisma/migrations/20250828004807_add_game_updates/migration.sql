-- CreateEnum
CREATE TYPE "public"."Resource" AS ENUM ('food', 'water', 'health');

-- CreateTable
CREATE TABLE "public"."game_updates" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "resource" "public"."Resource" NOT NULL,
    "resource_change_as_percent" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_updates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."game_updates" ADD CONSTRAINT "game_updates_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
