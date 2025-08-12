import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/authentication";
import { SCHEMA_SURVIVAL_DAY_RETURN } from "./survival_day.schema";


const survivalDayRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/:id', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch the survival day',
            tags: ['survival-day'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            response: {
                200: SCHEMA_SURVIVAL_DAY_RETURN
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        if (!id) {
            return reply.status(400).send({ message: 'Missing id' })
        }
        if (!request.user?.id) {
            return reply.status(401).send({ message: 'Unauthorized' })
        }
        try {
            const survivalDay = await prisma.survivalDay.findFirst({
                where: {
                    id
                }
            })
            if (!survivalDay) {
                return reply.status(404).send({ message: 'Survival day not found' })
            }
            return survivalDay
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default survivalDayRoutes