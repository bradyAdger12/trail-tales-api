import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { SCHEMA_GAME_RETURN } from "./game.schema";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/authentication";
import { fetchGameNotifications, fetchUnseenGameNotifications, getGameStats, markNotificationsAsSeen, startGame } from "./game.controller";
import { gameConfig } from "../../lib/game_config";
import { GameDifficulty } from "@prisma/client";


const storyRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/me', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch the user\'s current game',
            tags: ['game'],
            response: {
                200: SCHEMA_GAME_RETURN,
                default: { type: "object", properties: { error: { type: "string" } } }
            }
        }
    }, async (request, reply) => {
        try {
            const game = await prisma.game.findFirst({
                where: {
                    user_id: request.user?.id
                },
                include: {
                    character: true,
                    survival_days: {
                        orderBy: {
                            day: 'asc'
                        }
                    }
                }

            })
            if (!game) {
                return null
            }
            return game
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/difficulty', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Get the difficulty options of the game',
            tags: ['game'],
            response: {
                200: {
                    type: 'object',
                    additionalProperties: true
                }
            }
        }
    }, async () => {
        return gameConfig.difficulty
    })

    fastify.post('/start', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Start a new game',
            tags: ['game'],
            body: {
                type: 'object',
                properties: {
                    difficulty: { type: 'string' }
                }
            },
            response: {
                200: SCHEMA_GAME_RETURN,
                default: { type: "object", properties: { error: { type: "string" } } }
            }
        }
    }, async (request, reply) => {  
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        const { difficulty } = request.body as { difficulty: string }
        try {
            const game = await startGame(request.user?.id, difficulty as GameDifficulty)
            return game
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/:id/notifications', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Get the notifications for a game',
            tags: ['game'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            querystring: {
                type: 'object',
                properties: {
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                },
              }
        }
    }, async (request, reply) => {  
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        const { id } = request.params as { id: string }
        const { limit, offset } = request.query as { limit: number, offset: number }
        try {
            const response = await fetchGameNotifications(id, request.user?.id, limit, offset)
            return response
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/:id/notifications/unseen', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Get the notifications for a game',
            tags: ['game'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            }
        }
    }, async (request, reply) => {  
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        const { id } = request.params as { id: string }
        try {
            const notifications = await fetchUnseenGameNotifications(id, request.user?.id)
            return notifications
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.put('/:id/notifications/seen', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Update notifications',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            tags: ['game']
        }
    }, async (request, reply) => {  
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        const { id } = request.params as { id: string }
        try {
            await markNotificationsAsSeen(id, request.user?.id)
            return { success: true }
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.put('/:id/reset', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Reset a game',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            tags: ['game']
        }
    }, async (request, reply) => {  
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        const { id } = request.params as { id: string }
        try {
            await prisma.game.delete({
                where: {
                    user_id: request.user?.id,
                    id: id
                }
            })
            return { success: true }
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/:id/stats', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Get the stats for a game',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            tags: ['game']
        }
    }, async (request, reply) => {  
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        const { id } = request.params as { id: string }
        try {
            const stats = await getGameStats(id, request.user?.id)
            return stats
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default storyRoutes