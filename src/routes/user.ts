import { FastifyPluginAsync } from "fastify";
import { authenticate } from "../middleware/authentication";
import { prisma } from "..";
import { SAFE_USER_RETURN } from "../helper/safe_return_data";

const userRoutes: FastifyPluginAsync = async (fastify) => {
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