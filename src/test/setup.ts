import { teardown } from "tap";
import { prisma } from "../db";

teardown(async () => {
    await prisma.user.deleteMany({})
});