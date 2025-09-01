import { test, teardown } from 'tap'
import buildServer from '../../../server'
import { registerAndLoginUser } from '../../../lib/helper'
import { prisma } from '../../../db'

test('GET /user/me - fetch own user data', async (t) => {
    const fastify = await buildServer()
    const { token, user } = await registerAndLoginUser(fastify)
    const response = await fastify.inject({ method: 'GET', url: '/user/me', headers: { authorization: `Bearer ${token}` } })
    t.hasProps(response.json(), ['display_name', 'email', 'avatar_file_key'])

    t.teardown(async () => {
        await fastify.close()
    })
})