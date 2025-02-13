/*
  Warnings:

  - The primary key for the `squad_matchups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[squad_1_id]` on the table `squad_matchups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[squad_2_id]` on the table `squad_matchups` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "squad_matchups" DROP CONSTRAINT "squad_matchups_pkey",
ADD CONSTRAINT "squad_matchups_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "squad_matchups_squad_1_id_key" ON "squad_matchups"("squad_1_id");

-- CreateIndex
CREATE UNIQUE INDEX "squad_matchups_squad_2_id_key" ON "squad_matchups"("squad_2_id");

-- AddForeignKey
ALTER TABLE "squad_matchups" ADD CONSTRAINT "squad_matchups_squad_1_id_fkey" FOREIGN KEY ("squad_1_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_matchups" ADD CONSTRAINT "squad_matchups_squad_2_id_fkey" FOREIGN KEY ("squad_2_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
