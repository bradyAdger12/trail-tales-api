/*
  Warnings:

  - You are about to drop the `days` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "days" DROP CONSTRAINT "days_game_id_fkey";

-- DropTable
DROP TABLE "days";

-- CreateTable
CREATE TABLE "survival_days" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "description" TEXT,
    "number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survival_days_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "survival_days" ADD CONSTRAINT "survival_days_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
