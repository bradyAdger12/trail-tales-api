import Fastify from "fastify";
import 'dotenv/config'
import _ from 'lodash'
import authRoutes from "./routes/auth";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./routes/user";
import type { User } from '@prisma/client'
import { workoutRoutes, workoutsRoutes } from "./routes/workout";

// Init Prisma client
export const prisma = new PrismaClient()

declare module 'fastify' {
  interface FastifyRequest {
    user?: User
  }
}


// Define server
const port = (process.env.PORT || 3000) as number
const fastify = Fastify({
  logger: true
});


// Register components
fastify.register(authRoutes);
fastify.register(userRoutes, { prefix: '/user' })
fastify.register(workoutRoutes, { prefix: '/workout' })
fastify.register(workoutsRoutes, { prefix: '/workouts' })


// Basic routes
fastify.get("/health", async (request, reply) => {
  return 'Server is healthy!';
});


// Start Fastify server
const start = async () => {
  try {
    await fastify.listen({ port });
    console.log(`Server listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start()