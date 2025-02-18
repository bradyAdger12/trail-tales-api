import { FastifyPluginAsync } from "fastify"
import { authenticate } from "../../middleware/authentication"
import { SCHEMA_MATCHUP_RETURN } from "./matchup.schema"
import { getTimesAndSum } from "../../cron/post_matchup"
import _ from "lodash"
import { prisma } from "../../db"

// console.log(prisma)

const matchupRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/me', {
        preHandler: [authenticate], schema: {
            description: 'Fetch your active matchup',
            security: [{ bearerAuth: [] }],
            tags: ['matchup'],
            response: {
                200: { ...SCHEMA_MATCHUP_RETURN, properties: { ...SCHEMA_MATCHUP_RETURN.properties, _squad_one_score: { type: 'number' }, _squad_two_score: { type: 'number' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const matchup = await prisma.matchup.findFirst({
                orderBy: {
                    ends_at: 'desc'
                },
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
                                select: {
                                    user: {
                                        select: {
                                            display_name: true,
                                            avatar_file_key: true,
                                            matchup_entries: {
                                                select: {
                                                    value: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    squad_two: {
                        include: {
                            members: {
                                select: {
                                    user: {
                                        select: {
                                            display_name: true,
                                            avatar_file_key: true,
                                            matchup_entries: {
                                                select: {
                                                    value: true
                                                }
                                            }
                                        }
                                    }
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
            const squadOneScore = getTimesAndSum(matchup?.squad_one.members as any)
            const squadTwoScore = getTimesAndSum(matchup?.squad_two.members as any)
            matchup.squad_one.members = _.sortBy(matchup?.squad_one.members, (item) => item.user.matchup_entries[0]?.value)
            matchup.squad_two.members = _.sortBy(matchup?.squad_two.members, (item) => item.user.matchup_entries[0]?.value)
            return { ...matchup, _squad_one_score: squadOneScore, _squad_two_score: squadTwoScore }
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })

    // fastify.get('/squad/:id/matchup_results', {
    //     preHandler: [authenticate], schema: {
    //         description: 'Fetch a squads matchup results',
    //         security: [{ bearerAuth: [] }],
    //         tags: ['matchup'],
    //         params: {
    //             type: 'object',
    //             properties: {
    //                 id: { type: 'string' }
    //             }
    //         },
    //         response: {
    //             200: { ...SCHEMA_MATCHUP_RETURN, properties: { ...SCHEMA_MATCHUP_RETURN.properties, _squad_one_score: { type: 'number' }, _squad_two_score: { type: 'number' } } }
    //         }
    //     }
    // }, async (request, reply) => {
    //     const { id } = request.params as { id: string }
    //     try {
    //         const matchupResults = await prisma.matchupReport.findMany({
    //             where: {
                    
    //             }
    //         })
    //         if (!matchupResult) {
    //             return reply.status(404).send({ message: 'Matchups not found' })
    //         }
    //     } catch (e) {
    //         return reply.status(500).send({ message: e as string })
    //     }
    // })
}

export default matchupRoutes