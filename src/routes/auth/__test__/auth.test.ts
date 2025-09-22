import { teardown, test } from 'tap'
import buildServer from '../../../server'
import { faker } from '@faker-js/faker'
import { prisma } from '../../../db'
import { FastifyInstance } from 'fastify'
import { User } from '@prisma/client'

const display_name = faker.person.firstName()
const email = faker.internet.email()
const password = faker.internet.password({ length: 12 })
const timezone = faker.location.timeZone()

let fastify: FastifyInstance
let users: User[] = []


test('auth', async (t) => {

    t.before(async () => {
        fastify = await buildServer()
    })

    t.teardown(async () => {
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: users.map(user => user.id)
                }
            }
        })
        await fastify.close()
        await prisma.$disconnect()
    })

    await t.test('GET /health', async (t) => {
        const response = await fastify.inject({ method: 'GET', url: '/health' })
        t.same(response.json(), { status: 'ok' })
    })

    await t.test('POST /login - user cannot login without email', async (t) => {
        const response = await fastify.inject({ method: 'POST', url: '/login', payload: {} })
        t.equal(response.statusCode, 400)
        t.equal(response.json().message, `must have required property 'email'`)
    })

    await t.test('POST /login - user cannot login without password', async (t) => {
        const response = await fastify.inject({ method: 'POST', url: '/login', payload: { email } })
        t.equal(response.statusCode, 400)
        t.equal(response.json().message, `must have required property 'password'`)
    })

    await t.test('POST /login - invalid credentials', async (t) => {
        const response = await fastify.inject({ method: 'POST', url: '/login', payload: { email, password } })
        t.equal(response.statusCode, 401)
        t.equal(response.json().message, `Username or password is incorrect`)
    })

    await t.test('POST /register - password must be 8 characters', async (t) => {
        const response = await fastify.inject({ method: 'POST', url: '/register', payload: { email, password: 'foobar', display_name, timezone } })
        t.equal(response.statusCode, 400)
        t.equal(response.json().message, 'Password must be at least 8 characters long')
    })

    await t.test('POST /register - success', async (t) => {
        const response = await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name, timezone } })
        const user = await prisma.user.findUnique({ where: { email } })
        if (user) {
            users.push(user)
        }
        t.equal(response.statusCode, 201)
        t.same(response.json(), { success: true })
    })

    await t.test('POST /login - success', async (t) => {
        const response = await fastify.inject({ method: 'POST', url: '/login', payload: { email, password } })
        t.hasProps(response.json(), ['token', 'refreshToken', 'user'])
    })

    await t.test('POST /register - email already exists', async (t) => {
        await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name, timezone } })
        const response = await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name, timezone } })
        t.same(response.statusCode, 400)
        t.same(response.json().message, 'User with same email exists')
    })
})