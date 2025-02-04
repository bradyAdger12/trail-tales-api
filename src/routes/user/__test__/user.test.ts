import { test } from 'tap'
import buildServer, { prisma } from '../../../server'
import { faker } from '@faker-js/faker'
import { registerAndLoginUser } from '../../../lib/helper'

test('GET /user/me - fetch own user data', async (t) => {
    const fastify = buildServer()
    const { token, user } = await registerAndLoginUser(fastify)
    const response = await fastify.inject({ method: 'GET', url: '/user/me', headers: { authorization: `Bearer ${token}` } })
    t.hasProps(response.json(), ['display_name', 'email', 'avatar_file_key'])

    t.teardown(async () => {
        await fastify.close()
        await prisma.user.deleteMany({})
    })
})