import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { SCHEMA_GAME_RETURN } from "./game.schema";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/authentication";
import { startGame } from "./game.controller";

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
                    difficulty: { type: 'string', default: 'easy' }
                }
            },
            response: {
                200: SCHEMA_GAME_RETURN
            }
        }
    }, async (request, reply) => {
        console.log('hi')
        const { difficulty } = request.body as { difficulty: string }
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        try {
            const game = await startGame(request.user?.id, difficulty)
            return game
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default storyRoutes