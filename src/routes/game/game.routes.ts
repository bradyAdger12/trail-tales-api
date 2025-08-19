import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { SCHEMA_CHARACTER_TEMPLATE, SCHEMA_GAME_RETURN } from "./game.schema";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/authentication";
import { startGame } from "./game.controller";
import { Character } from "@prisma/client";


const storyRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/me', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch the user\'s current game',
            tags: ['game'],
            response: {
                200: SCHEMA_GAME_RETURN
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

    fastify.post('/start', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Start a new game',
            tags: ['game'],
            body: {
                type: 'object',
                properties: {
                    weekly_distance_in_kilometers: { type: 'number' },
                    threshold_pace_minutes: { type: 'number' },
                    threshold_pace_seconds: { type: 'number' },
                    character: SCHEMA_CHARACTER_TEMPLATE
                }
            },
            response: {
                200: SCHEMA_GAME_RETURN
            }
        }
    }, async (request, reply) => {  
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        const { weekly_distance_in_kilometers, threshold_pace_minutes, threshold_pace_seconds, character } = request.body as { weekly_distance_in_kilometers: number, threshold_pace_minutes: number, threshold_pace_seconds: number, character: Character }
        try {
            const game = await startGame(request.user?.id, weekly_distance_in_kilometers, threshold_pace_minutes, threshold_pace_seconds, character)
            return game
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default storyRoutes