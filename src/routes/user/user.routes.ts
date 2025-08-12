import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../../middleware/authentication";
import { User } from "@prisma/client";
import _ from "lodash";
import { SCHEMA_USER_RETURN } from "./user.schema";
import { prisma } from "../../db";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.put('/me', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Update user',
            tags: ['user'],
            body: {
                type: 'object',
                properties: {
                    avatar_file_key: { type: 'string' },
                    strava_access_token: { type: 'string' },
                    strava_refresh_token: { type: 'string' },
                    display_name: { type: 'string' }
                }
            },
            response: {
                200: SCHEMA_USER_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const body = request.body as Partial<User>
            const payload = {} as User
            if (_.has(body, 'display_name')) {
                payload.display_name = body.display_name as string
            }
            if (_.has(body, 'avatar_file_key')) {
                const avatar_file_key = body.avatar_file_key || null
                payload.avatar_file_key = avatar_file_key
            }
            if (_.has(body, 'strava_access_token')) {
                payload.strava_access_token = body.strava_access_token as string
            }
            if (_.has(body, 'strava_refresh_token')) {
                payload.strava_refresh_token = body.strava_refresh_token as string
            }
            const user = await prisma.user.update({
                data: payload,
                where: {
                    id: request.user?.id
                }
            })
            if (!user) {
                return reply.status(404).send('User not found')
            }
            return user
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
    fastify.get('/me', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch me data',
            tags: ['user'],
            response: {
                200: SCHEMA_USER_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    id: request.user?.id
                }
            })
            if (!user) {
                return reply.status(404).send('User not found')
            }
            return user
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
}

export default userRoutes