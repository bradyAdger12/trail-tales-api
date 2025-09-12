-- CreateEnum
CREATE TYPE "public"."Unit" AS ENUM ('metric', 'imperial');

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "unit" "public"."Unit" NOT NULL DEFAULT 'imperial';
