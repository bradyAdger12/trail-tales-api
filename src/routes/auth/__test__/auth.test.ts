import { test } from 'tap'
import buildServer, { prisma } from '../../../server'
import { faker } from '@faker-js/faker'

const display_name = faker.person.firstName()
const email = faker.internet.email()
const password = faker.internet.password()

test('GET /health', async (t) => {
    const fastify = buildServer()
    const response = await fastify.inject({ method: 'GET', url: '/health' })
    t.same(response.json(), { status: 'ok' })

    t.teardown(() => {
        fastify.close()
    })
})

test('POST /login - user cannot login without email', async (t) => {
    const fastify = buildServer()
    const response = await fastify.inject({ method: 'POST', url: '/login', payload: {} })
    t.equal(response.statusCode, 400)
    t.equal(response.json().message, `body must have required property 'email'`)

    t.teardown(() => {
        fastify.close()
    })
})

test('POST /login - user cannot login without password', async (t) => {
    const fastify = buildServer()
    const response = await fastify.inject({ method: 'POST', url: '/login', payload: { email } })
    t.equal(response.statusCode, 400)
    t.equal(response.json().message, `body must have required property 'password'`)

    t.teardown(() => {
        fastify.close()
    })
})

test('POST /login - invalid credentials', async (t) => {
    const fastify = buildServer()
    const response = await fastify.inject({ method: 'POST', url: '/login', payload: { email, password } })
    t.equal(response.statusCode, 401)
    t.equal(response.json().message, `Username or password is incorrect`)

    t.teardown(() => {
        fastify.close()
    })
})

test('POST /register - password must be 8 characters', async (t) => {
    const fastify = buildServer()
    const response = await fastify.inject({ method: 'POST', url: '/register', payload: { email, password: 'foobar', display_name } })
    t.equal(response.statusCode, 400)
    t.equal(response.json().message, 'Password must be at least 8 characters long')

    t.teardown(async () => {
        fastify.close()
    })
})

test('POST /register - success', async (t) => {
    const fastify = buildServer()
    const response = await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name } })
    t.same(response.json(), { success: true })

    t.teardown(async () => {
        fastify.close()
    })
})

test('POST /login - success', async (t) => {
    const fastify = buildServer()
    const response = await fastify.inject({ method: 'POST', url: '/login', payload: { email, password } })
    t.hasProps(response.json(), ['token', 'user'])

    t.teardown(async () => {
        await fastify.close()
        await prisma.user.deleteMany({}) // Delete created users
    })
})

test('POST /register - email already exists', async (t) => {
    const fastify = buildServer()
    await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name } })
    const response1 = await fastify.inject({ method: 'POST', url: '/register', payload: { email, password, display_name } })
    t.same(response1.json().message, 'User with same email exists')

    t.teardown(async () => {
        fastify.close()
        await prisma.user.deleteMany({}) // Delete created users
    })
})