import { FastifyPluginAsync } from "fastify"
import { authenticate } from "../../middleware/authentication"
import { squadAuthorization } from "../../middleware/authorize_squad"
import { prisma } from "../../server"
import { SCHEMA_MATCHUP_RETURN } from "./matchup.schema"

const matchupRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/me', {
        preHandler: [authenticate], schema: {
            description: 'Fetch your active matchup',
            security: [{ bearerAuth: [] }],
            tags: ['matchup'],
            response: {
                200: SCHEMA_MATCHUP_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const matchup = await prisma.matchup.findFirst({
                where: {
                    OR: [
                        {
                            squad_one: {
                                members: {
                                    some: {
                                        user_id: request.user?.id
                                    }
                                }
                            }
                        },
                        {
                            squad_two: {
                                members: {
                                    some: {
                                        user_id: request.user?.id
                                    }
                                }
                            }
                        }
                    ]
                },
                include: {
                    squad_one: {
                        include: {
                            members: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    squad_two: {
                        include: {
                            members: {
                                include: {
                                    user: true
                                }
                            }
                        }
                    },
                    challenge: true
                }
            })
            if (!matchup) {
                return reply.status(404).send({ message: 'Matchup not found' })
            }
            return matchup
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })
}

export default matchupRoutes