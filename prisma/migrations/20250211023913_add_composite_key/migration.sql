/*
  Warnings:

  - The primary key for the `activities` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "activities" DROP CONSTRAINT "activities_pkey",
ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("source_id", "id");
