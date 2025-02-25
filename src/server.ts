import Fastify from "fastify";
import 'dotenv/config'
import _ from 'lodash'
import authRoutes from "./routes/auth/auth.routes";
import userRoutes from "./routes/user/user.routes";
import squadRoutes from "./routes/squad/squad.routes";
import memberRoutes from "./routes/member/member.routes";
import activityRoutes from "./routes/activity/activity.routes";
import matchupRoutes from "./routes/matchup/matchup.routes";
import stravaRoutes from "./routes/strava/strava.routes";
import challengeRoutes from "./routes/challenge/challenge.routes";

// Build Server
function buildServer() {

  // Define server
  const fastify = Fastify({
    logger: false
  });

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
        { name: 'squad', description: 'Squad related end-points' },
        { name: 'member', description: 'Member related end-points' },
        { name: 'matchup', description: 'Matchup related end-points' },
        { name: 'activity', description: 'Activity related end-points' }
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
  fastify.register(memberRoutes, { prefix: '/member' })
  fastify.register(activityRoutes, { prefix: '/activity' })
  fastify.register(matchupRoutes, { prefix: '/matchup' })
  fastify.register(stravaRoutes, { prefix: '/strava' })
  fastify.register(challengeRoutes, { prefix: '/challenges' })

  fastify.get('/health', (request, reply) => {
    return { status: 'ok' }
  })

  return fastify
}

export default buildServer