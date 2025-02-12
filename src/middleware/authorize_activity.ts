import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../server";
import _ from "lodash";
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