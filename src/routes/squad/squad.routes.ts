import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/authentication";
import { prisma } from '../../server'; import { Squad } from "@prisma/client";
import _ from "lodash";
import { SCHEMA_SQUAD_RETURN, SCHEMA_SQUADS_RETURN } from "./squad.schema";
import { randomUUID } from "node:crypto";
import { sendEmail } from "../../resend/send_email";

const squadRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/create', {
        preHandler: authenticate, schema: {
            description: 'Create a new running squad',
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            body: {
                type: 'object',
                properties: {
                    is_public: { type: 'boolean', default: false },
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    description: { type: 'string', minLength: 1 }
                },
                required: ['name', 'description']
            },
            response: {
                201: SCHEMA_SQUAD_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const body = request.body as Partial<Squad>
            const name = body.name
            const userId = request.user?.id
            const description = body.description
            const isPublic = body.is_public || false
            const squadId = randomUUID()
            const ownsSquad = await prisma.squad.findFirst({
                where: {
                    owner_id: userId
                }
            })
            if (!!ownsSquad) {
                return reply.status(500).send({ message: 'You may only create one squad' })
            }
            const squadNameExists = await prisma.squad.findFirst({
                where: {
                    name
                },
                select: {
                    name: true
                }
            })
            console.log(squadNameExists?.name)
            if (squadNameExists && squadNameExists.name.toLowerCase() === name?.toLowerCase()) {
                return reply.status(500).send({ message: `Squad with name '${name}' already exists` })
            }
            const [squad, squadMember] = await prisma.$transaction([
                prisma.squad.create({
                    data: {
                        id: squadId,
                        name: name!,
                        owner_id: userId!,
                        description: description!,
                        is_public: isPublic
                    }
                }),
                prisma.squadMember.create({
                    data: {
                        squad_id: squadId,
                        user_id: userId!,
                    }
                })
            ])
            return reply.status(201).send(squad)
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/all', {
        preHandler: authenticate, schema: {
            description: 'Fetch all public squads',
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                200: SCHEMA_SQUADS_RETURN
            }
        }
    }, async (request, reply) => {
        const { limit, offset } = request.query as { limit?: number, offset?: number }
        try {
            const squads = await prisma.squad.findMany({
                where: {
                    is_public: {
                        equals: true
                    }
                },
                take: limit || 10,
                skip: offset || 0,
                select: {
                    _count: true,
                    id: true,
                    name: true,
                    owner_id: true,
                    members: {
                        select: {
                            user: {
                                select: {
                                    id: true,
                                    display_name: true
                                }
                            }
                        }
                    },
                    description: true
                }
            })
            return squads
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/me', {
        preHandler: authenticate, schema: {
            description: 'Fetch your squad',
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                200: SCHEMA_SQUAD_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const squad = await prisma.squad.findFirst({
                where: {
                    owner_id: request.user?.id
                },
                select: {
                    _count: true,
                    id: true,
                    name: true,
                    owner_id: true,
                    description: true,
                    members: {
                        select: {
                            user: {
                                select: {
                                   
                                    id: true,
                                    display_name: true
                                }
                            }
                        }
                    },

                }
            })
            console.log(squad)
            return squad
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.put('/:id', {
        preHandler: authenticate, schema: {
            description: 'Update a squad',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' }
                },
                required: ['name', 'description']
            },
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                200: SCHEMA_SQUAD_RETURN
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        const { name, description } = request.body as { name?: string, description?: string }
        const payload: Partial<Squad> = {}
        if (name) {
            payload.name = name
        }
        if (description) {
            payload.description = description
        }
        try {
            const squad = await prisma.squad.update({
                data: payload,
                where: {
                    id,
                    owner_id: request.user?.id
                },
                select: {
                    id: true,
                    name: true,
                    members: true,
                    description: true,
                    created_at: true,
                    updated_at: true,
                }
            })
            return squad
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.delete('/:id', {
        preHandler: authenticate, schema: {
            description: 'Fetch all squads you own',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                200: { properties: { success: { type: 'boolean' } } }
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        try {
            await prisma.squad.delete({
                where: {
                    owner_id: request.user?.id,
                    id
                }
            })
            return { success: true }
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.post('/:id/join', {
        preHandler: authenticate, schema: {
            description: 'Send a request to join a squad',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    user_id: { type: 'string' }
                }
            },
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                201: { properties: { success: { type: 'boolean' } } }
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        const { user_id } = request.body as { user_id: string }
        try {
            const requestExists = await prisma.squadJoinRequest.findFirst({
                where: {
                    user_id,
                    squad_id: id
                }
            })
            if (requestExists) {
                return reply.status(409).send({ message: 'Join request has already been sent to this squad' })
            }
            const squadRequest = await prisma.squadJoinRequest.create({
                data: {
                    squad_id: id,
                    user_id
                },
                select: {
                    squad: {
                        select: {
                            name: true
                        }
                    },
                    user: {
                        select: {
                            display_name: true
                        }
                    }
                }
            })
            await sendEmail('join_squad.html', { url: `${process.env.WEB_BASE_URL}/squad/${id}/join_requests`, name: squadRequest.squad.name, display_name: squadRequest.user.display_name }, 'Join Squad Request')
            return reply.status(201).send({ success: true })
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default squadRoutes