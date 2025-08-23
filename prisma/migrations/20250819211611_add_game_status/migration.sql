/*
  Warnings:

  - You are about to drop the column `health_loss` on the `survival_day_options` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('active', 'won', 'lost');

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "survival_day_options" DROP COLUMN "health_loss";
