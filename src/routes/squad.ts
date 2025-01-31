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

    fastify.get('/', {
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
}

export default squadRoutes