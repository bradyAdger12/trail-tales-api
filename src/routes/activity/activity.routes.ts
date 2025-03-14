import { FastifyPluginAsync } from "fastify"
import _ from "lodash"
import { prisma } from "../../db"
import { authenticate } from "../../middleware/authentication"
import { SCHEMA_ACTIVITIES_RETURN, SCHEMA_ACTIVITY_RETURN } from "../activity/activity.schema"
const activityRoutes: FastifyPluginAsync = async (fastify) => {
    // https://www.strava.com/oauth/token?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}&refresh_token=${refresh_token}&grant_type=refresh_token

    fastify.route({
        url: '/imported',
        method: ['GET'],
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Get imported activities',
            tags: ['activity'],
            querystring: {
                type: 'object',
                properties: {
                    source_ids: { type: 'string' }
                }
            },
            response: {
                200: SCHEMA_ACTIVITIES_RETURN
            }
        },
        handler: async (request, reply) => {
            try {
                const { source_ids } = request.query as { source_ids: string }
                const activities = await prisma.activity.findMany({
                    where: {
                        source_id: { in: source_ids.split(',') }
                    }
                })
                console.log(activities)
                return activities
            } catch (e) {
                console.error(e)
                return e
            }
        }
    })
}

export default activityRoutes