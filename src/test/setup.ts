import { teardown } from "tap";
import { prisma } from "../db";
import { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker";
import { User } from "@prisma/client";

export async function registerAndLoginUser(fastify: FastifyInstance): Promise<{ token: string, user: User}> {
    const display_name = faker.person.firstName()
    const email = faker.internet.email()
    const password = faker.internet.password()
    const unit = 'imperial'
    const timezone = 'America/Denver'
    await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name, unit, timezone } })
    const loginResponse = await fastify.inject({ method: 'POST', url: '/login', payload: { email, password } })
    return loginResponse.json()
}

teardown(async () => {
    await prisma.user.deleteMany({})
    // await prisma.game.deleteMany({})
});