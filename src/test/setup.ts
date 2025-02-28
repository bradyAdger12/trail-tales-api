import { teardown } from "tap";
import { postMatchupCron } from "../cron/post_matchup";
import { prisma } from "../db";

teardown(async () => {
    await prisma.user.deleteMany({})
    await prisma.squad.deleteMany({})
});