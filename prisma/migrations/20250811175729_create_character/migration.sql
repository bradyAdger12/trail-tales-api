/*
  Warnings:

  - You are about to drop the column `food` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `health` on the `games` table. All the data in the column will be lost.
  - You are about to drop the column `water` on the `games` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "games" DROP COLUMN "food",
DROP COLUMN "health",
DROP COLUMN "water";

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "health" INTEGER NOT NULL DEFAULT 100,
    "food" INTEGER NOT NULL DEFAULT 1,
    "water" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "characters_game_id_key" ON "characters"("game_id");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
