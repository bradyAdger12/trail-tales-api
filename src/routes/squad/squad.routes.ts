import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/authentication";
import { Prisma, Squad } from "@prisma/client";
import _ from "lodash";
import { SCHEMA_SQUAD_RETURN, SCHEMA_SQUADS_REQUEST_RETURN, SCHEMA_SQUADS_RETURN } from "./squad.schema";
import { randomUUID } from "node:crypto";
import { sendEmail } from "../../resend/send_email";
import { squadAuthorization } from "../../middleware/authorize_squad";
import { prisma } from "../../db";

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
            const squadId = randomUUID()
            const ownsSquad = await prisma.squad.findFirst({
                where: {
                    owner_id: userId
                }
            })
            if (!!ownsSquad) {
                return reply.status(500).send({ message: 'You may only be a member of one squad' })
            }
            const squadNameExists = await prisma.squad.findFirst({
                where: {
                    name
                },
                select: {
                    name: true
                }
            })
            if (squadNameExists && squadNameExists.name.toLowerCase() === name?.toLowerCase()) {
                return reply.status(500).send({ message: `Squad with name '${name}' already exists` })
            }
            const [squad, squadMember] = await prisma.$transaction([
                prisma.squad.create({
                    data: {
                        id: squadId,
                        name: name!,
                        owner_id: userId!,
                        description: description!
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
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'number' },
                    query: { type: 'string' },
                    is_engaged: { type: 'boolean' },
                    offset: { type: 'number' }
                }
            },
            tags: ['squad'],
            response: {
                200: SCHEMA_SQUADS_RETURN
            }
        }
    }, async (request, reply) => {
        const { limit, offset, query, is_engaged} = request.query as { limit?: number, offset?: number, query?: string, is_engaged?: boolean }
        try {
            let where = {} as Prisma.SquadWhereInput
            if (query) {
                where = {
                    name: {
                        contains: query,
                        mode: 'insensitive'
                    }
                }
            } if (_.has(request.query, 'is_engaged')) {
                where.is_engaged = {
                    equals: is_engaged
                }
            }
            const squads = await prisma.squad.findMany({
                take: limit || 10,
                skip: offset || 0,
                where,
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

    fastify.get('/:id', {
        preHandler: authenticate, schema: {
            description: 'Fetch squad by ID',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            tags: ['squad'],
            response: {
                200: SCHEMA_SQUAD_RETURN
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        try {
            const squad = await prisma.squad.findFirst({
                where: id === 'me' ? {
                    members: {
                        some: {
                            user_id: request.user?.id
                        }
                    }
                } : { id },
                select: {
                    _count: true,
                    id: true,
                    name: true,
                    level: true,
                    owner_id: true,
                    description: true,
                    losses: true,
                    wins: true,
                    xp: true,
                    members: {
                        select: {
                            created_at: true,
                            user: {
                                select: {
                                    avatar_file_key: true,
                                    id: true,
                                    display_name: true
                                }
                            }
                        }
                    },

                }
            })
            if (!squad) {
                return reply.status(404).send({ message: 'Squad not found' })
            }
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

    fastify.post('/:id/accept_request', {
        preHandler: [authenticate, squadAuthorization], schema: {
            description: 'Accept a request to join a squad',
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
            if (!requestExists) {
                return reply.status(409).send({ message: 'This request does not exist' })
            }
            await prisma.$transaction([
                prisma.squadMember.create({
                    data: {
                        squad_id: id,
                        user_id: user_id
                    }
                }),
                prisma.squadJoinRequest.delete({
                    where: {
                        user_id_squad_id: {
                            squad_id: id,
                            user_id
                        }
                    }
                })
            ])
            return reply.status(200).send({ success: true })
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.delete('/:id', {
        preHandler: [authenticate, squadAuthorization], schema: {
            description: 'Delete your squad',
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
            await prisma.$transaction([
                prisma.squadMember.deleteMany({
                    where: {
                        squad_id: id
                    }
                }),
                prisma.squadJoinRequest.deleteMany({
                    where: {
                        squad_id: id
                    }
                }),
                prisma.squad.delete({
                    where: {
                        id
                    }
                })
            ])
            return { success: true }
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/:id/requests', {
        preHandler: [authenticate, squadAuthorization], schema: {
            description: 'View requests to join a squad',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                200: SCHEMA_SQUADS_REQUEST_RETURN
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        try {
            const requestExists = await prisma.squadJoinRequest.findMany({
                where: {
                    squad_id: id
                },
                select: {
                    created_at: true,
                    user: {
                        select: {
                            id: true,
                            avatar_file_key: true,
                            display_name: true
                        }
                    }
                }
            })
            return requestExists
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.post('/:id/request', {
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
            const squadMember = await prisma.squadMember.findFirst({
                where: {
                    user_id
                }
            })
            if (squadMember) {
                return reply.status(500).send({ message: 'You can only be a member of one squad.' })
            }
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