import { FastifyPluginAsync } from "fastify"
import { authenticate } from "../../middleware/authentication"
import { SCHEMA_MATCHUP_RETURN, SCHEMA_MATCHUPS_RETURN } from "./matchup.schema"
import { getTimesAndSum } from "../../cron/post_matchup"
import _ from "lodash"
import { prisma } from "../../db"
import { Squad } from "@prisma/client" 
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
                where: {
                    completed: false,
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
                }
            })
            if (!matchup) {
                return reply.status(404).send({ message: 'Matchup not found' })
            }
            const matchupWithEntries = await prisma.matchup.findFirst({
                where: {
                    id: matchup.id
                },
                select: {
                    id: true,
                    starts_at: true,
                    ends_at: true,
                    created_at: true,
                    challenge: {
                        select: {
                            description: true,
                            type: true,
                            label: true,
                            name: true,
                        }
                    },
                    squad_one: {
                        select: {
                            id: true,
                            name: true,
                            owner_id: true,
                            members: {
                                select: {
                                    user: {
                                        select: {
                                            id: true,
                                            display_name: true,
                                            avatar_file_key: true,
                                            matchup_entries: {
                                                where: {
                                                    matchup_id: matchup.id
                                                },
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
                        select: {
                            id: true,
                            name: true,
                            owner_id: true,
                            members: {
                                select: {
                                    user: {
                                        select: {
                                            display_name: true,
                                            id: true,
                                            avatar_file_key: true,
                                            matchup_entries: {
                                                where: {
                                                    matchup_id: matchup.id
                                                },
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
                }
            })
            if (!matchupWithEntries) {
                return reply.status(404).send({ message: 'Matchup not found' })
            }
            const squadOneScore = getTimesAndSum(matchupWithEntries?.squad_one.members as any)
            const squadTwoScore = getTimesAndSum(matchupWithEntries?.squad_two.members as any)
            matchupWithEntries.squad_one.members = _.sortBy(matchupWithEntries?.squad_one.members, (item) => item.user.matchup_entries[0]?.value)
            matchupWithEntries.squad_two.members = _.sortBy(matchupWithEntries?.squad_two.members, (item) => item.user.matchup_entries[0]?.value)
            return { ...matchupWithEntries, _squad_one_score: squadOneScore, _squad_two_score: squadTwoScore }
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })

    fastify.get('/squad/:squad_id/results', {
        preHandler: [authenticate], schema: {
            description: 'Fetch a squads matchup results',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    squad_id: { type: 'string' }
                }
            },
            tags: ['matchup'],
            response: {
                200: { ...SCHEMA_MATCHUPS_RETURN, properties: { ...SCHEMA_MATCHUP_RETURN.properties, _squad_one_score: { type: 'number' }, _squad_two_score: { type: 'number' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { squad_id } = request.params as { squad_id: string }
            const matchups = await prisma.matchup.findMany({
                orderBy: {
                    ends_at: 'desc'
                },
                where: {
                    completed: true,
                    OR: [
                        {
                            squad_one: {
                                id: squad_id
                            }
                        },
                        {
                            squad_two: {
                                id: squad_id
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    challenge: true,
                    ends_at: true,
                    squad_one: {
                        select: {
                            name: true
                        }
                    },
                    squad_two: {
                        select: {
                            name: true
                        }
                    }
                }
            })
            return matchups
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })

    fastify.post('/create', {
        preHandler: [authenticate], schema: {
            description: 'Create a matchup',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    squadId: { type: 'string' },
                    challengeId: { type: 'string' },
                    random: { type: 'boolean' },
                    duration: { type: 'number' }
                }
            },
            tags: ['matchup'],
            response: {
                201: { type: 'object', properties: { success: { type: 'boolean' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { squadId, challengeId, random, duration } = request.body as { squadId?: string, challengeId: string, random?: boolean, duration: number }
            let squadToChallenge: Squad | null = null
            const mySquad = await prisma.squad.findFirst({
                where: {
                    owner_id: request.user?.id
                }
            })
            if (!mySquad) {
                return reply.status(400).send('You must own a squad in order to create a matchup')
            }
            if (squadId) {
                squadToChallenge = await prisma.squad.findFirst({
                    where: {
                        id: squadId,
                        is_engaged: false
                    }
                })
            }
            if (random) {
                const squads: Squad[] = await prisma.$queryRaw`SELECT * FROM "squads" WHERE id != ${mySquad.id} ORDER BY RANDOM() LIMIT 1`;
                if (squads.length > 0) {
                    squadToChallenge = squads[0]
                }
            }

            if (!squadToChallenge) {
                return reply.status(404).send('We are unable to create a matchup for you at this time. Please try again later')
            } else {
                const now = new Date();
                const endsAtDate = new Date();
                endsAtDate.setDate(now.getDate() + duration)
                await prisma.$transaction([
                    prisma.matchup.create({
                        data: {
                            challenge_id: challengeId,
                            squad_one_id: mySquad.id,
                            squad_two_id: squadToChallenge.id,
                            ends_at: endsAtDate,
                        }
                    }),
                    prisma.squad.update({
                        data: {
                            is_engaged: true
                        },
                        where: {
                            id: mySquad.id
                        }
                    }),
                    prisma.squad.update({
                        data: {
                            is_engaged: true
                        },
                        where: {
                            id: squadToChallenge.id
                        }
                    })
                ])
            }
            return { success: true }
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })

    fastify.get('/:id/results', {
        preHandler: [authenticate], schema: {
            description: 'Fetch a matchup result',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            tags: ['matchup'],
            response: {
                200: { ...SCHEMA_MATCHUP_RETURN, properties: { ...SCHEMA_MATCHUP_RETURN.properties, _squad_one_score: { type: 'number' }, _squad_two_score: { type: 'number' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string }
            const matchup = await prisma.matchup.findFirst({
                orderBy: {
                    ends_at: 'desc'
                },
                where: {
                    completed: true,
                    id
                },
                select: {
                    id: true,
                    starts_at: true,
                    ends_at: true,
                    created_at: true,
                    challenge: {
                        select: {
                            description: true,
                            type: true,
                            label: true,
                            name: true,
                        }
                    },
                    squad_one: {
                        select: {
                            id: true,
                            name: true,
                            owner_id: true,
                            members: {
                                select: {
                                    user: {
                                        select: {
                                            id: true,
                                            display_name: true,
                                            avatar_file_key: true,
                                            matchup_entries: {
                                                where: {
                                                    matchup_id: id
                                                },
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
                        select: {
                            id: true,
                            name: true,
                            owner_id: true,
                            members: {
                                select: {
                                    user: {
                                        select: {
                                            display_name: true,
                                            id: true,
                                            avatar_file_key: true,
                                            matchup_entries: {
                                                where: {
                                                    matchup_id: id
                                                },
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
}

export default matchupRoutes