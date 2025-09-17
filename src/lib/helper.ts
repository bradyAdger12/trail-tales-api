import { faker } from "@faker-js/faker"
import { FastifyInstance } from "fastify"
import { User } from "@prisma/client"

export async function registerAndLoginUser(fastify: FastifyInstance): Promise<{ token: string, user: User}> {
    const display_name = faker.person.firstName()
    const email = faker.internet.email()
    const password = faker.internet.password()
    await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name } })
    const loginResponse = await fastify.inject({ method: 'POST', url: '/login', payload: { email, password } })
    return loginResponse.json()
}

export function capValue(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min)
}