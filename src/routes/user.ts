import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../middleware/authentication";
import { prisma } from "..";
import { SAFE_USER_RETURN } from "../lib/safe_return_data";
import { User } from "@prisma/client";
import _ from "lodash";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.put('/', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Update user',
            tags: ['user'],
            body: {
                type: 'object',
                properties: {
                    avatar_file_key: { type: 'string', default: '' },
                    display_name: { type: 'string', default: '' }
                },
                required: ['display_name']
            },
            response: {
                200: {
                    type: 'object',
                    $ref: 'user_return#'
                }
            }
        }
    }, async (request, reply) => {
        try {
            const body = request.body as Partial<User>
            const display_name = body.display_name
            const avatar_file_key = body.avatar_file_key || null
            const payload = {} as User
            if (display_name) {
                payload.display_name = display_name
            }
            if (_.has(body, 'avatar_file_key')) {
                payload.avatar_file_key = avatar_file_key
            }
            const user = await prisma.user.update({
                select: SAFE_USER_RETURN,
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
                200: {
                    type: 'object',
                    $ref: 'user_return#'
                }
            }
        }
    }, async (request, reply) => {
        try {
            const user = await prisma.user.findFirst({
                select: SAFE_USER_RETURN,
                where: {
                    email: request.user?.email
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