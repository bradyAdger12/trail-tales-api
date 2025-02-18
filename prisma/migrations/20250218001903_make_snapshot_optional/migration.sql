-- AlterTable
ALTER TABLE "matchups" ALTER COLUMN "completed" SET DEFAULT false,
ALTER COLUMN "snapshot" DROP NOT NULL;
