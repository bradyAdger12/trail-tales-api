import { FastifyPluginAsync } from "fastify"
import _ from "lodash"
import { prisma } from "../../db"
import axios from "axios"

// console.log(prisma)

const stravaRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.route({
        url: '/webhook',
        method: ['GET', 'POST'],
        handler: async (request, reply) => {
            const query = request.query
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
                        const stravaActivityResponse = await axios.get('https://strava.com/api/v3/activities/' + body.object_id, {
                            headers: {
                                Authorization: `Bearer ${user.strava_access_token}`
                            }
                        })
                        if (stravaActivityResponse.data && stravaActivityResponse.data.type.toLowerCase().includes('run')) {
                            let streamData
                            try {
                                const streamResponse = await axios.get('https://strava.com/api/v3/activities/' + body.object_id + '/streams?keys=distance,time', {
                                    headers: {
                                        Authorization: `Bearer ${user.strava_access_token}`
                                    }
                                })
                                streamData = streamResponse.data
                            } catch (e) {}
                            if (!streamData) {
                                throw 'Activity must have stream data'
                            }
                            await prisma.activity.create({
                                data: {
                                    source: 'strava',
                                    source_id: body.object_id.toString(),
                                    source_created_at: stravaActivityResponse.data.start_date,
                                    name: stravaActivityResponse.data.name,
                                    distance_series: _.find(streamData, (item) => item.type === 'distance')?.data || [],
                                    time_series: _.find(streamData, (item) => item.type === 'time')?.data || [],
                                    distance_in_meters: stravaActivityResponse.data.distance,
                                    elapsed_time_in_seconds: stravaActivityResponse.data.elapsed_time,
                                    polyline: stravaActivityResponse.data.map.summary_polyline,
                                    user_id: user.id,

                                }
                            })
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