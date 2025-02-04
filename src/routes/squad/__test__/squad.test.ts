import { test } from 'tap'
import buildServer, { prisma } from '../../../server'
import { faker } from '@faker-js/faker'
import { registerAndLoginUser } from '../../../lib/helper'

test('POST /squad/create - name and description required to create a squad', async (t) => {
    const fastify = buildServer()
    const { token } = await registerAndLoginUser(fastify)
    const response = await fastify.inject({
        method: 'POST', url: '/squad/create', headers: { authorization: `Bearer ${token}` }, body: {
            is_public: true
        }
    })
    t.equal(response.statusCode, 400)

    t.teardown(async () => {
        await fastify.close()
        await prisma.user.deleteMany({})
        await prisma.squad.deleteMany({})
    })
})

test('POST /squad/create - successfully create a squad', async (t) => {
    const fastify = buildServer()
    const { token } = await registerAndLoginUser(fastify)
    const response = await fastify.inject({
        method: 'POST', url: '/squad/create', headers: { authorization: `Bearer ${token}` }, body: {
            name: 'squad1',
            description: 'squad description',
            is_public: true
        }
    })
    t.hasProps(response.json(), ['name', 'description'])
    t.equal(response.statusCode, 201)

    t.teardown(async () => {
        await fastify.close()
        await prisma.user.deleteMany({})
        await prisma.squad.deleteMany({})
    })
})

test('GET /squad/all - fetch all squads', async (t) => {
    const fastify = buildServer()
    const { token } = await registerAndLoginUser(fastify)
    await fastify.inject({
        method: 'POST', url: '/squad/create', headers: { authorization: `Bearer ${token}` }, body: {
            name: 'squad1',
            description: 'squad description',
            is_public: true
        }
    })
    await fastify.inject({
        method: 'POST', url: '/squad/create', headers: { authorization: `Bearer ${token}` }, body: {
            name: 'squad2',
            description: 'squad description',
            is_public: true
        }
    })
    const response = await fastify.inject({ method: 'GET', url: '/squad/all', headers: { authorization: `Bearer ${token}` } })
    t.equal(response.json().length, 2)
    t.teardown(async () => {
        await fastify.close()
        await prisma.user.deleteMany({})
        await prisma.squad.deleteMany({})
    })
})

test('GET /squad/me - fetch squads belonging to me', async (t) => {
    const fastify = buildServer()
    const { token } = await registerAndLoginUser(fastify)
    const { token: token1 } = await registerAndLoginUser(fastify)
    await fastify.inject({
        method: 'POST', url: '/squad/create', headers: { authorization: `Bearer ${token1}` }, body: {
            name: 'squad1',
            description: 'squad description',
            is_public: true
        }
    })
    await fastify.inject({
        method: 'POST', url: '/squad/create', headers: { authorization: `Bearer ${token}` }, body: {
            name: 'squad2',
            description: 'squad description',
            is_public: true
        }
    })
    const response = await fastify.inject({ method: 'GET', url: '/squad/me', headers: { authorization: `Bearer ${token1}` } })
    t.equal(response.json().length, 1)
    t.teardown(async () => {
        await fastify.close()
        await prisma.user.deleteMany({})
        await prisma.squad.deleteMany({})
    })
})