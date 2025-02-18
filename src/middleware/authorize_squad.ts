import { FastifyReply, FastifyRequest } from "fastify";
import _ from "lodash";
import { prisma } from "../db";
export const squadAuthorization = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    const userId = request.user?.id
    prisma.squad.findFirst({
        where: {
            owner_id: userId
        }
    }).then((squad) => {
        if (squad?.owner_id !== userId) {
            return reply.status(401).send({ message: 'You are not authorized to access this resource' })
        }
        done()
    })
}