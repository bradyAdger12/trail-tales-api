import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../middleware/authentication";
import { prisma } from "..";
import { Squad } from "@prisma/client";
import _ from "lodash";

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
                    name: { type: 'string', default: '' },
                    description: { type: 'string', default: '' }
                },
                required: ['name', 'description']
            },
            response: {
                200: { $ref: 'squad_return#' }
            }
        }
    }, async (request, reply) => {
        try {
            const body = request.body as Partial<Squad>
            const name = body.name
            const userId = request.user?.id
            const description = body.description
            const isPublic = body.is_public || false
            const squad = await prisma.squad.create({
                data: {
                    name: name!,
                    owner_id: userId!,
                    description: description!,
                    is_public: isPublic
                }
            })
            return squad
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
                200: { $ref: 'squads_return#' }
            }
        }
    }, async (request, reply) => {
        try {
            const squads = await prisma.squad.findMany({
                where: {
                    is_public: {
                        equals: true
                    }
                },
                select: {
                    id: true,
                    name: true,
                    members: true,
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
            description: 'Fetch all squads you own',
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                200: { $ref: 'squads_return#' }
            }
        }
    }, async (request, reply) => {
        try {
            const squads = await prisma.squad.findMany({
                where: {
                    owner_id: {
                        equals: request.user?.id
                    },
                    is_public: {
                        equals: true
                    }
                },
                select: {
                    id: true,
                    name: true,
                    members: true,
                    description: true
                }
            })
            return squads
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
                    name: { type: 'string', default: '' },
                    description: { type: 'string', default: '' }
                },
                required: ['name', 'description']
            },
            security: [{ bearerAuth: [] }],
            tags: ['squad'],
            response: {
                200: { $ref: 'squad_return#' }
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
}

export default squadRoutes