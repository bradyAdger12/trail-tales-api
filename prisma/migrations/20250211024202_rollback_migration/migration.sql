/*
  Warnings:

  - The primary key for the `activities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[source_id]` on the table `activities` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "activities" DROP CONSTRAINT "activities_pkey",
ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "activities_source_id_key" ON "activities"("source_id");
