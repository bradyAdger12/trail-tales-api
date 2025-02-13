/*
  Warnings:

  - You are about to drop the column `squad_1_id` on the `squad_matchups` table. All the data in the column will be lost.
  - You are about to drop the column `squad_2_id` on the `squad_matchups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[squad_one_id]` on the table `squad_matchups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[squad_two_id]` on the table `squad_matchups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `challenge_id` to the `squad_matchups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `squad_one_id` to the `squad_matchups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `squad_two_id` to the `squad_matchups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "squad_matchups" DROP CONSTRAINT "squad_matchups_squad_1_id_fkey";

-- DropForeignKey
ALTER TABLE "squad_matchups" DROP CONSTRAINT "squad_matchups_squad_2_id_fkey";

-- DropIndex
DROP INDEX "squad_matchups_squad_1_id_key";

-- DropIndex
DROP INDEX "squad_matchups_squad_2_id_key";

-- AlterTable
ALTER TABLE "squad_matchups" DROP COLUMN "squad_1_id",
DROP COLUMN "squad_2_id",
ADD COLUMN     "challenge_id" TEXT NOT NULL,
ADD COLUMN     "squad_one_id" TEXT NOT NULL,
ADD COLUMN     "squad_two_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "squad_matchups_squad_one_id_key" ON "squad_matchups"("squad_one_id");

-- CreateIndex
CREATE UNIQUE INDEX "squad_matchups_squad_two_id_key" ON "squad_matchups"("squad_two_id");

-- AddForeignKey
ALTER TABLE "squad_matchups" ADD CONSTRAINT "squad_matchups_squad_one_id_fkey" FOREIGN KEY ("squad_one_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_matchups" ADD CONSTRAINT "squad_matchups_squad_two_id_fkey" FOREIGN KEY ("squad_two_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_matchups" ADD CONSTRAINT "squad_matchups_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
