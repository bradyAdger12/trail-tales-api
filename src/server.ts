import Fastify from "fastify";
import 'dotenv/config'
import cors from '@fastify/cors'
import _ from 'lodash'
import authRoutes from "./routes/auth/auth.routes";
import userRoutes from "./routes/user/user.routes";
import { sendEmail } from "./resend/send_email";
import { APP_NAME } from "./lib/constants";
import { User } from "@prisma/client";
import stravaRoutes from "./routes/strava/strava.routes";
import activityRoutes from "./routes/activity/activity.routes";
import gameRoutes from "./routes/game/game.routes";
import survivalDayRoutes from "./routes/survival_day/survival_day.routes";
declare module 'fastify' {
  interface FastifyRequest {
    user?: User
  }
}

// Build Server
export async function buildServer() {

  // Define server
  const fastify = Fastify({
    logger: process.env.NODE_ENV === 'production'
  });

  // Register cors
  fastify.register(cors, {
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    origin: true
  })

  // Register rate limit
  await fastify.register(import('@fastify/rate-limit'), {
    max: 100,
    timeWindow: '1 minute'
  })


  // Register swagger
  fastify.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Trail Tales',
        description: 'Trail Tales swagger API',
        version: '0.1.0'
      },
      tags: [
        { name: 'auth', description: 'Unauthenticated User related end-points' },
        { name: 'user', description: 'User related end-points' }
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

  // Register swagger ui
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
  fastify.register(survivalDayRoutes, { prefix: '/survival-days' })
  fastify.register(gameRoutes, { prefix: '/games' })
  fastify.register(stravaRoutes, { prefix: '/strava' })
  fastify.register(activityRoutes, { prefix: '/activities' })

  // Register error handler
  fastify.setErrorHandler((error: any, request, reply) => {
    fastify.log.error(error)
    
    // Handle validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation error',
        message: error.validation[0].message
      })
    }
    
    // Handle JWT errors
    if (error.message.includes('jwt') || error.message.includes('token')) {
      return reply.status(401).send({
        error: 'Authentication error',
        message: 'Invalid or expired token'
      })
    }
    
    // Handle rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later'
      })
    }
    
    // Default error response
    const statusCode = error.statusCode || 500
    reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal server error' : error.message,
      message: statusCode >= 500 ? 'Something went wrong' : error.message
    })
  })

  fastify.get('/', (request, reply) => {
    return { status: 'ok' }
  })

  fastify.get('/health', (request, reply) => {
    return { status: 'ok' }
  })

  fastify.post('/contact', {
    schema: {
      description: `Send a message to ${APP_NAME} email`,
      security: [{ bearerAuth: [] }],
      tags: ['contact'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          message: { type: 'string' }
        },
        required: ['name', 'email', 'message']
      },
      response: {
        200: { type: 'object', properties: { success: { type: 'boolean' } } },
        default: { type: "object", properties: { error: { type: "string" } } }
      }
    }
  }, async (request, reply) => {
    const { email, message, name } = request.body as { name: string, message: string, email: string }
    try {
      await sendEmail('contact_submission.html', { email, message, name }, 'Contact Submission')
    } catch (e) {
      reply.status(500).send('Error sending message')
    }
  })

  return fastify
}

export default buildServer