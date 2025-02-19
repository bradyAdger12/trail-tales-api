import { FastifyPluginAsync } from "fastify"
import _ from "lodash"

// console.log(prisma)

const stravaRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/webhook', (request, reply) => {
        const query = request.query
        if (_.has(query, 'hub.challenge')) {
            return { "hub.challenge": query["hub.challenge"] }
        }
    })
}

export default stravaRoutes