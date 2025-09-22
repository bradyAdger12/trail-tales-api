import { test } from 'tap'
import buildServer from '../../../server'
import { registerAndLoginUser } from '../../../test/setup'

test('POST /story/start - Begin story', async (t) => {
    const fastify = await buildServer()
    const { token, user } = await registerAndLoginUser(fastify)
    t.pass()
    // const response = await fastify.inject({ method: 'GET', url: '/user/me', headers: { authorization: `Bearer ${token}` } })
    // t.hasProps(response.json(), ['display_name', 'email', 'avatar_file_key'])

    t.teardown(async () => {
        await fastify.close()
    })
})