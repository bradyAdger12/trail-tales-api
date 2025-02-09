import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "../server";
import _ from "lodash";
export const squadAuthorization = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    const userId = request.user?.id
    let id

    // Check params for squad id
    if (_.has(request.params, 'squad_id')) {
        id = request.params.squad_id
    }

    // Check params for squad id
    if (_.has(request.body, 'squad_id')) {
        id = request.body.squad_id
    }
    prisma.squad.findFirst({
        where: {
            id
        }
    }).then((squad) => {
        if (squad?.owner_id !== userId) {
            return reply.status(401).send({ message: 'You are not authorized to access this resource' })
        }
        done()
    })
}