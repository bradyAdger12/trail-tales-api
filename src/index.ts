import Fastify from "fastify";
import 'dotenv/config'
import _ from 'lodash'
import authRoutes from "./routes/auth";
import { PrismaClient } from "@prisma/client";
import userRoutes from "./routes/user";
import type { User } from '@prisma/client'
import squadRoutes from "./routes/squad";

// Init Prisma client
export const prisma = new PrismaClient()

// Fastify request extension
declare module 'fastify' {
  interface FastifyRequest {
    user?: User
  }
}


// Define server
const port = (process.env.PORT || 3000) as number
export const fastify = Fastify({
  logger: true
});

//Schemas
fastify.addSchema({
  $id: 'authorization',
  type: 'object',
  properties: {
    'authorization': { type: 'string' }
  },
  required: ['authorization']
})
fastify.addSchema({
  $id: 'user_return',
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    display_name: { type: 'string' },
    avatar_file_key: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  }
})

fastify.addSchema({
  $id: 'squad_return',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  }
})

fastify.addSchema({
  $id: 'squads_return',
  type: 'array',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  }
})

fastify.register(require('@fastify/swagger'), {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Run Squad',
      description: 'Testing the Run Squad swagger API',
      version: '0.1.0'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'auth', description: 'Unauthenticated User related end-points' },
      { name: 'user', description: 'User related end-points' },
      { name: 'squad', description: 'Squad related end-points' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

fastify.register(import('@fastify/swagger-ui'), {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  }
})


// Register components
fastify.register(authRoutes);
fastify.register(userRoutes, { prefix: '/user' })
fastify.register(squadRoutes, { prefix: '/squad' })


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