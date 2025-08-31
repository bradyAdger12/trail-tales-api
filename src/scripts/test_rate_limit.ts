
import { buildServer } from '../server'

async function testRateLimit() {
    const fastify = await buildServer()
    try {
        for (let i = 0; i < 101; i++) {
            const response = await fastify.inject({
                method: 'GET',
                url: '/health'
            })
            if (response.statusCode === 429) {
                console.log('Rate limit exceeded')
                break
            }
        }
    } catch (error) {
        console.log(error)
        // console.error(error)
    }
    fastify.close()
}

testRateLimit()