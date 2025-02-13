/*
  Warnings:

  - You are about to drop the `squad_matchups` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "squad_matchups" DROP CONSTRAINT "squad_matchups_challenge_id_fkey";

-- DropForeignKey
ALTER TABLE "squad_matchups" DROP CONSTRAINT "squad_matchups_squad_one_id_fkey";

-- DropForeignKey
ALTER TABLE "squad_matchups" DROP CONSTRAINT "squad_matchups_squad_two_id_fkey";

-- DropTable
DROP TABLE "squad_matchups";

-- CreateTable
CREATE TABLE "matchups" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "squad_one_id" TEXT NOT NULL,
    "squad_two_id" TEXT NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matchups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matchups_squad_one_id_key" ON "matchups"("squad_one_id");

-- CreateIndex
CREATE UNIQUE INDEX "matchups_squad_two_id_key" ON "matchups"("squad_two_id");

-- AddForeignKey
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_squad_one_id_fkey" FOREIGN KEY ("squad_one_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_squad_two_id_fkey" FOREIGN KEY ("squad_two_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matchups" ADD CONSTRAINT "matchups_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
