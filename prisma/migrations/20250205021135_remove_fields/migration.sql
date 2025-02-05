/*
  Warnings:

  - You are about to drop the column `updated_at` on the `squad_join_requests` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `squad_members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "squad_join_requests" DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "squad_members" DROP COLUMN "updated_at";
