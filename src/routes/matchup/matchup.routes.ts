import { FastifyPluginAsync } from "fastify"
import { authenticate } from "../../middleware/authentication"
import { SCHEMA_MATCHUP_RETURN, SCHEMA_MATCHUPS_RETURN } from "./matchup.schema"
import { getTimesAndSum } from "../../cron/post_matchup"
import _ from "lodash"
import { prisma } from "../../db"
import { squadAuthorization } from "../../middleware/authorize_squad"

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

    fastify.get('/squad/:id/results', {
        preHandler: [authenticate], schema: {
            description: 'Fetch a squads matchup results',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            tags: ['matchup'],
            response: {
                200: { ...SCHEMA_MATCHUPS_RETURN, properties: { ...SCHEMA_MATCHUP_RETURN.properties, _squad_one_score: { type: 'number' }, _squad_two_score: { type: 'number' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string }
            const matchups = await prisma.matchup.findMany({
                orderBy: {
                    ends_at: 'desc'
                },
                where: {
                    completed: true,
                    OR: [
                        {
                            squad_one: {
                                id
                            }
                        },
                        {
                            squad_two: {
                                id
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
            // const matchupWithEntries = []
            // for (const matchup of matchups) {
            //     const matchupWithEntriesResponse = await prisma.matchup.findFirst({
            //         where: {
            //             id: matchup.id
            //         },
            //         select: {
            //             id: true,
            //             starts_at: true,
            //             ends_at: true,
            //             created_at: true,
            //             challenge: {
            //                 select: {
            //                     description: true,
            //                     type: true,
            //                     label: true,
            //                     name: true,
            //                 }
            //             },
            //             squad_one: {
            //                 select: {
            //                     id: true,
            //                     name: true,
            //                     members: {
            //                         select: {
            //                             user: {
            //                                 select: {
            //                                     id: true,
            //                                     display_name: true,
            //                                     avatar_file_key: true,
            //                                     matchup_entries: {
            //                                         where: {
            //                                             matchup_id: matchup.id
            //                                         },
            //                                         select: {
            //                                             value: true
            //                                         }
            //                                     }
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             },
            //             squad_two: {
            //                 select: {
            //                     id: true,
            //                     name: true,
            //                     members: {
            //                         select: {
            //                             user: {
            //                                 select: {
            //                                     display_name: true,
            //                                     id: true,
            //                                     avatar_file_key: true,
            //                                     matchup_entries: {
            //                                         where: {
            //                                             matchup_id: matchup.id
            //                                         },
            //                                         select: {
            //                                             value: true
            //                                         }
            //                                     }
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             },
            //         }
            //     })
            //     if (matchupWithEntriesResponse) {
            //         const squadOneScore = getTimesAndSum(matchupWithEntriesResponse?.squad_one.members as any)
            //         const squadTwoScore = getTimesAndSum(matchupWithEntriesResponse?.squad_two.members as any)
            //         matchupWithEntriesResponse.squad_one.members = _.sortBy(matchupWithEntriesResponse?.squad_one.members, (item) => item.user.matchup_entries[0]?.value)
            //         matchupWithEntriesResponse.squad_two.members = _.sortBy(matchupWithEntriesResponse?.squad_two.members, (item) => item.user.matchup_entries[0]?.value)
            //         matchupWithEntries.push({ ...matchupWithEntriesResponse, _squad_one_score: squadOneScore, _squad_two_score: squadTwoScore })
            //     }
            // }
            return matchups
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