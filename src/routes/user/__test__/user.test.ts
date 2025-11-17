import { test, teardown } from 'tap'
import buildServer from '../../../server'
import { registerAndLoginUser } from '../../../test/setup'
import { FastifyInstance } from 'fastify'
import { prisma } from '../../../db'
import { User } from '@prisma/client'
let fastify: FastifyInstance
let users: User[] = []
test('users', async (t) => {

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

    await t.test('GET /user/me - fetch own user data', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const response = await fastify.inject({ method: 'GET', url: '/user/me', headers: { authorization: `Bearer ${token}` } })
        t.hasProps(response.json(), ['display_name', 'email', 'avatar_file_key'])
    }).catch(e => {
        console.error(e)
    })
})