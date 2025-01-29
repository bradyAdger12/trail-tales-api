import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../middleware/authentication";
import { prisma } from "..";
import { SAFE_USER_RETURN } from "../helper/safe_return_data";
import { User } from "@prisma/client";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.put('/', { preHandler: authenticate }, async (request, reply) => {
        try {
            const body = request.body as { display_name?: string }
            const display_name = body.display_name
            const payload = {} as User
            if (display_name) {
                payload.display_name = display_name
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
    fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
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