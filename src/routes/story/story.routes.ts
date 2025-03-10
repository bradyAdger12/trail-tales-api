import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { SCHEMA_STORIES_RETURN, SCHEMA_STORY_RETURN } from "./story.schema";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/authentication";

const storyRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/templates', {
        preHandler: authenticate,
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

    fastify.get('/preview/:id', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            description: 'Preview a story',
            tags: ['story'],
            response: {
                200: SCHEMA_STORY_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string }
            const storyTemplate = await prisma.storyTemplate.findFirst({
                where: {
                    id
                }
            })
            return storyTemplate
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.post('/start', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    template_id: { type: 'string' }
                },
                required: ['template_d']
            },
            description: 'Begin a story',
            tags: ['story'],
            response: {
                200: SCHEMA_STORY_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const { template_id } = request.body as { template_id: string }
            const storyTemplate = await prisma.story.findFirst({
                where: {
                    id: template_id
                },
                select: {
                    title: true,
                    description: true,
                    cover_image_url: true
                }
            })
            if (!storyTemplate) {
                return reply.status(404).send({ message: 'Story could not be started. Not found' })
            }
            if (request.user?.id) {
                const story = await prisma.story.create({
                    data: {
                        title: storyTemplate.title,
                        description: storyTemplate.description,
                        cover_image_url: storyTemplate.cover_image_url,
                        user_id: request.user?.id,
                        template_id
                    }
                })
                return story
            } else {
                return reply.status(401).send({ message: 'You must be authorized to complete this action' })
            }
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default storyRoutes