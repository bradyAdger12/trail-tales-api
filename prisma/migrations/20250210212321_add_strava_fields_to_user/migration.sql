-- AlterTable
ALTER TABLE "squads" ALTER COLUMN "is_public" SET DEFAULT true;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "strava_access_token" TEXT,
ADD COLUMN     "strava_refresh_token" TEXT;
