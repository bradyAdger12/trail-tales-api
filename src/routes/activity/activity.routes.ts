import { FastifyPluginAsync } from "fastify"
import _ from "lodash"
import { prisma } from "../../db"
import { authenticate } from "../../middleware/authentication"
import { SCHEMA_ACTIVITIES_RETURN, SCHEMA_ACTIVITY_RETURN } from "../activity/activity.schema"
import { fetchStravaActivity } from "../strava/strava.controller"
import { refreshStravaToken } from "../strava/strava.controller"
import {  processChapter } from "./activity.controller"
import { SCHEMA_ITEMS_RETURN } from "../item/item.schema"
const activityRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.route({
        url: '/import',
        method: ['POST'],
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Import a Strava activity',
            body: {
                type: 'object',
                properties: {
                    source_id: { type: 'string' },
                    source: { type: 'string' }
                }
            },
            tags: ['activity'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        activity: SCHEMA_ACTIVITY_RETURN,
                        items: SCHEMA_ITEMS_RETURN
                    }
                }
            }
        },
        handler: async (request, reply) => {
            try {
                const { source_id, source } = request.body as { source_id: string, source: string }
                await refreshStravaToken(request.user?.id)
                const user = await prisma.user.findFirst({
                    where: {
                        id: request.user?.id
                    }
                })
                if (!user) {
                    return reply.status(404).send({ message: 'user not found' })
                }
                if (source === 'strava') {
                    const stravaActivity = await fetchStravaActivity(source_id, user?.strava_access_token)
                    const activity = await prisma.activity.create({
                        data: {
                            source,
                            source_id: stravaActivity.id.toString(),
                            name: stravaActivity.name,
                            distance_in_meters: stravaActivity.distance,
                            elapsed_time_in_seconds: stravaActivity.elapsed_time,
                            polyline: stravaActivity.map.summary_polyline,
                            user_id: user.id,
                            source_created_at: stravaActivity.start_date
                        }
                    })
                    const response = await processChapter(user, activity)
                    return { activity, items: response?.items }
                }
            } catch (e) {
                console.error(e)
                return e
            }
        }
    })

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
                return activities
            } catch (e) {
                console.error(e)
                return e
            }
        }
    })
}

export default activityRoutes