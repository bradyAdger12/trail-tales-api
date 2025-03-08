import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { SCHEMA_STORIES_RETURN } from "./story.schema";
import { prisma } from "../../db";

const storyRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/templates', {
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch story templates',
            tags: ['story'],
            response: {
                200: SCHEMA_STORIES_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const storyTemplates = await prisma.storyTemplate.findMany()
            return storyTemplates
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default storyRoutes