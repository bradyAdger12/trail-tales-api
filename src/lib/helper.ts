import { faker } from "@faker-js/faker"
import { FastifyInstance } from "fastify"
import { User } from "@prisma/client"

export function capValue(value: number, min: number, max: number) {
    return Math.max(Math.min(value, max), min)
}