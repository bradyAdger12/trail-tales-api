import { FastifyPluginAsync } from "fastify"
import { authenticate } from "../../middleware/authentication"
import { SCHEMA_MEMBER_RETURN } from "./member.schema"
import { squadAuthorization } from "../../middleware/authorize_squad"
import { prisma } from "../../server"

const memberRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.delete('/:user_id/:squad_id', {
        preHandler: [authenticate, squadAuthorization], schema: {
            description: 'Remove a member from a squad',
            security: [{ bearerAuth: [] }],
            tags: ['member'],
            params: {
                type: 'object',
                properties: {
                    user_id: { type: 'string' },
                    squad_id: { type: 'string' }
                }
            },
            response: {
                200: { properties: { success: { type: 'boolean' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const { user_id, squad_id } = request.params as { user_id: string, squad_id: string }
            await prisma.squadMember.delete({
                where: {
                    squad: {
                        owner_id: {
                            not: {
                                equals: user_id
                            }
                        }
                    },
                    user_id_squad_id: {
                        user_id,
                        squad_id
                    }
                },
            })
            return { success: true }
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default memberRoutes