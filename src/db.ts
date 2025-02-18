import { PrismaClient, User } from '@prisma/client'
export const prisma = new PrismaClient()

// Fastify request extension
declare module 'fastify' {
    interface FastifyRequest {
        user?: User
    }
}