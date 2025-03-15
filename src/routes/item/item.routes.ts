import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { prisma } from "../../db";

const characterRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/:id/use', {
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Use an item',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            tags: ['item'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                },
                404: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string }
            const chapter = await prisma.chapter.findFirst({
                where: {
                    activity_id: null
                }
            })
            if (!chapter) {
                return reply.status(400).send({ message: 'Error using item' })
            }
            const item = await prisma.item.findFirst({
                where: {
                    id
                }
            })
            if (!item) {
                return reply.status(404).send({ message: 'Item not found' })
            }
            if (item.benefit === 'health') {
                await prisma.user.update({
                    where: { id: request.user?.id },
                    data: { health: { increment: item.value } }
                })
            } else if (item.benefit === 'distance') {
                await prisma.action.update({
                    where: {
                        id: chapter.id,
                        selected: true
                    },
                    data: {
                        distance_in_meters: {
                            decrement: item.value
                        }
                    }
                })
            }
            return reply.status(200).send('Item used')
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default characterRoutes