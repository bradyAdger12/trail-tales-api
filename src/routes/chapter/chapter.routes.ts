import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { SCHEMA_STORIES_RETURN, SCHEMA_STORY_RETURN } from "../story/story.schema";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/authentication";
import { z } from 'genkit'; // Import Zod, which is re-exported by Genkit.
import { Action } from "@prisma/client";
import { SCHEMA_CHAPTER_RETURN } from "./chapter.schema";
const chapterRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/:id', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch a chapter from a story',
            tags: ['chapter'],
            response: {
                200: SCHEMA_CHAPTER_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string }
            const chapter = await prisma.chapter.findFirst({
                where: {
                    id
                },
                include: {
                    actions: {
                        orderBy: {
                            difficulty: 'asc'
                        }
                    }
                }
            })
            if (!chapter) {
                return reply.status(404).send({ message: 'Chapter not found' })
            }
            return chapter
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })

    fastify.put('/:chapter_id/select_action/:action_id', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Select an action',
            tags: ['chapter'],
            params: {
                type: 'object',
                properties: {
                    chapter_id: { type: 'string' },
                    action_id: { type: 'string' }
                }
            },
            response: {
                200: SCHEMA_CHAPTER_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const { action_id, chapter_id } = request.params as { action_id: string, chapter_id: string }
            const [action, actions] = await prisma.$transaction([
                prisma.action.update({
                    where: {
                        user_id: request.user?.id,
                        id: action_id
                    },
                    data: {
                        selected: true
                    }    
                }),
                prisma.action.updateMany({
                    where: {
                        user_id: request.user?.id,
                        id: {
                            not: {
                                equals: action_id
                            }
                        }
                    },
                    data: {
                        selected: false
                    }
                })
            ])
            if (!action) {
                return reply.status(400).send({ message: 'Action not found' })
            }
            return action
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })
}

export default chapterRoutes