import { User } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from 'jsonwebtoken'
export const authenticate = (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    const authHeader = request.headers['authorization']
    if (!authHeader) {
        return reply.status(403).send('You do have not have permissions to access this resource')
    }
    try {
        const token: string = authHeader?.split(' ')[1]!
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string)
        if (decodedToken) {
            request.user = decodedToken as User
        }
    } catch (e) {
        return reply.status(401).send('You do have not have permissions to access this resource')
    }
    done()
}