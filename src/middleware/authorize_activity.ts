import { FastifyReply, FastifyRequest } from "fastify";
import _ from "lodash";
import { prisma } from "../db";
export const activityAuthorization = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    let id
    if (_.has(request.params, 'id')) {
        id = request.params.id
    }
    prisma.activity.findFirst({
        where: {
            id
        }
    }).then((activity) => {
        if (activity?.user_id !== request.user?.id) {
            return reply.status(401).send({ message: 'You are not authorized to access this resource' })
        }
        done()
    })
}