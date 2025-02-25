import { FastifyPluginAsync } from "fastify";
import { SCHEMA_CHALLENGES_RETURN } from "./challenge.schema";
import { authenticate } from "../../middleware/authentication";
import { prisma } from "../../db";

const challengeRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', {
        preHandler: authenticate,
        schema: {
            tags: ['challenge'],
            response: {
                200: SCHEMA_CHALLENGES_RETURN
            }
        }
    }, async (request, reply) => {
        const challenges = await prisma.challenge.findMany()
        return challenges
    })

}

export default challengeRoutes