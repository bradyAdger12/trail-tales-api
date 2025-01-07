/*
  Warnings:

  - You are about to drop the column `owner_id` on the `workouts` table. All the data in the column will be lost.
  - Added the required column `creator_id` to the `workouts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "workouts" DROP CONSTRAINT "workouts_owner_id_fkey";

-- AlterTable
ALTER TABLE "workouts" DROP COLUMN "owner_id",
ADD COLUMN     "creator_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "users_workouts" (
    "user_id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_workouts_pkey" PRIMARY KEY ("user_id","workout_id")
);

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_workouts" ADD CONSTRAINT "users_workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_workouts" ADD CONSTRAINT "users_workouts_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
