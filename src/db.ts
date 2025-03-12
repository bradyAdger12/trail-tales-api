import { PrismaClient, User } from '@prisma/client'
import Fastify from "fastify";
export const prisma = new PrismaClient()

declare module 'fastify' {
    interface FastifyRequest {
        user?: User
    }
}