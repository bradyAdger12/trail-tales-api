import { FastifyPluginAsync } from "fastify"
import _ from "lodash"
import { prisma } from "../../db"
import axios from "axios"
import { authenticate } from "../../middleware/authentication"
import { refreshStravaToken } from "./strava.controller"
import { processDay } from "../activity/activity.controller"
const stravaRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.route({
        url: '/activities',
        method: ['GET'],
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Get strava activities',
            tags: ['strava'],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'number', default: 1 },
                    per_page: { type: 'number', default: 10 }
                }
            }
        },
        handler: async (request, reply) => {
            const { page, per_page } = request.query as { page: number, per_page: number }
            try {
                const user = await prisma.user.findFirst({
                    where: {
                        id: request.user?.id
                    }
                })
                const { access_token } = await refreshStravaToken(request.user?.id, user?.strava_refresh_token || '')
                if (!user) {
                    return reply.status(404).send({ message: 'user not found' })
                } else if (!user.strava_access_token) {
                    return reply.status(400).send({ message: 'strava account not authenticated' })
                }
                const response = await axios.get('https://strava.com/api/v3/athlete/activities', {
                    params: {
                        page,
                        per_page, 
                    },
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                })
                return response.data
            } catch (e) {
                return reply.status(500).send({ message: 'error fetching activities' })
            }
        }
    })

    fastify.route({
        url: '/authorize',
        method: ['POST'],
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Authorize strava account',
            tags: ['strava'],
            body: {
                type: 'object',
                properties: { code: { type: 'string' } },
                required: ['code']
            },
            response: {
                200: {
                    type: 'object', properties: {
                        access_token: { type: 'string' },
                        refresh_token: { type: 'string' }
                    }
                }
            }
        },
        handler: async (request, reply) => {
            const { code } = request.body as { code: string }
            try {
                const response = await axios.post(`https://www.strava.com/oauth/token?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}&code=${code}&grant_type=authorization_code`)
                await prisma.user.update({
                    where: {
                        id: request.user?.id
                    },
                    data: {
                        strava_owner_id: response.data.athlete.id,
                    }
                })
                if (response.data) {
                    return { refresh_token: response.data.refresh_token, access_token: response.data.access_token }
                }
            } catch (e) {
                return e
            }
        }
    })


    fastify.route({
        url: '/webhook',
        method: ['GET', 'POST'],
        handler: async (request, reply) => {
            const query = request.query
            const validActivityTypes = ['walk', 'run', 'hike']
            const body = request.body as { aspect_type: string, object_id: number, owner_id: number, object_type: string }
            if (_.has(query, 'hub.challenge')) {
                return { "hub.challenge": query["hub.challenge"] }
            }
            try {
                if (body && body.aspect_type == 'create' && body.object_type === 'activity') {
                    const user = await prisma.user.findFirst({
                        where: {
                            strava_owner_id: body.owner_id
                        }
                    })
                    if (user) {
                        const { access_token } = await refreshStravaToken(user.id, user.strava_refresh_token || '')
                        const stravaActivityResponse = await axios.get('https://strava.com/api/v3/activities/' + body.object_id, {
                            headers: {
                                Authorization: `Bearer ${access_token}`
                            }
                        })
                        if (stravaActivityResponse.data && validActivityTypes.includes(stravaActivityResponse.data.type.toLowerCase())) {
                            let streamData
                            try {
                                const streamResponse = await axios.get('https://strava.com/api/v3/activities/' + body.object_id + '/streams?keys=distance,time', {
                                    headers: {
                                        Authorization: `Bearer ${access_token}`
                                    }
                                })
                                streamData = streamResponse.data
                            } catch (e) { }
                            if (!streamData) {
                                throw 'Activity must have stream data'
                            }
                            const activity = await prisma.activity.create({
                                data: {
                                    source: 'strava',
                                    source_id: body.object_id.toString(),
                                    source_created_at: stravaActivityResponse.data.start_date,
                                    name: stravaActivityResponse.data.name,
                                    distance_series: [],
                                    time_series: [],
                                    distance_in_meters: stravaActivityResponse.data.distance,
                                    elapsed_time_in_seconds: stravaActivityResponse.data.elapsed_time,
                                    polyline: stravaActivityResponse.data.map.summary_polyline,
                                    user_id: user.id,

                                }
                            })
                            await processDay(user, activity)
                        }

                    }
                } else if (body && body.aspect_type == 'delete' && body.object_type === 'activity') {
                    await prisma.activity.delete({
                        where: {
                            source_id: body.object_id.toString()
                        }
                    })
                }
            } catch (e) {
                console.error(e)
            }
        }
    })
}

export default stravaRoutes