import { FastifyPluginAsync } from "fastify"
import { SCHEMA_ACTIVITIES_RETURN, SCHEMA_ACTIVITY_RETURN } from "./activity.schema";
import { Activity, Challenge, Matchup } from "@prisma/client";
import { authenticate } from "../../middleware/authentication";
import { activityAuthorization } from "../../middleware/authorize_activity";
import _ from "lodash";
import { prisma } from "../../db";
import { processActivityForMatchup } from "./activity.controller";

const activityRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post('/import', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Import an activity',
            tags: ['activity'],
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    polyline: { type: 'string' },
                    source: { type: 'string' },
                    distance_series: { type: 'array' },
                    time_series: { type: 'array' },
                    source_id: { type: 'string' },
                    distance_in_meters: { type: 'number' },
                    elapsed_time_in_seconds: { type: 'number' }
                },
                required: ['name', 'polyline', 'source', 'source_id', 'distance_in_meters', 'elapsed_time_in_seconds', 'time_series', 'distance_series']
            },
            response: {
                201: SCHEMA_ACTIVITY_RETURN
            }
        }
    }, async (request, reply) => {
        const { name, polyline, source, source_id, distance_in_meters, elapsed_time_in_seconds, time_series, distance_series } = request.body as Activity

        try {
            if (!request.user?.id) {
                return reply.status(403).send('You are not authorized to access this resource')
            }
            const foundActivity = await prisma.activity.findFirst({
                where: {
                    source_id
                }
            })
            if (foundActivity) {
                return reply.status(400).send({ message: `Activity from ${source} already imported` })
            }
            const currentMatchup = await prisma.matchup.findFirst({
                include: {
                    challenge: true
                },
                where: {
                    completed: false,
                    ends_at: {
                        gte: new Date().toISOString()
                    },
                    starts_at: {
                        lte: new Date().toISOString()
                    },
                    OR: [
                        {
                            squad_one: {
                                members: {
                                    some: {
                                        user_id: request.user.id
                                    }
                                }
                            }
                        },
                        {
                            squad_two: {
                                members: {
                                    some: {
                                        user_id: request.user.id
                                    }
                                }
                            }
                        }
                    ]
                }
            })
            const activity = await prisma.activity.create({
                data: {
                    name,
                    user_id: request.user.id,
                    polyline,
                    time_series,
                    distance_series,
                    source,
                    source_id,
                    distance_in_meters,
                    elapsed_time_in_seconds
                }
            })
            if (currentMatchup) {
                await processActivityForMatchup(request.user.id, activity, currentMatchup)
            }
            return activity
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    });

    fastify.put('/:id', {
        preHandler: [authenticate, activityAuthorization],
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Update an activity',
            tags: ['activity'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' }
                },
                required: ['name']
            },
            response: {
                200: SCHEMA_ACTIVITY_RETURN
            }
        }
    }, async (request, reply) => {
        const { name } = request.body as Activity
        const { id } = request.params as { id: string }
        try {
            if (!request.user?.id) {
                return reply.status(403).send('You are not authorized to access this resource')
            }
            const activity = await prisma.activity.update({
                where: {
                    id
                },
                data: {
                    name
                }
            })
            return activity
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    });

    fastify.delete('/:id', {
        preHandler: [authenticate, activityAuthorization],
        schema: {
            description: 'Delete activity',
            security: [{ bearerAuth: [] }],
            tags: ['activity'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            response: {
                200: { properties: { success: { type: 'boolean' } } }
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        try {
            await prisma.activity.delete({
                where: {
                    id,
                    user_id: request.user?.id
                }
            })
            return { success: true }
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    });

    fastify.get('/me/all', {
        preHandler: [authenticate],
        schema: {
            description: 'Fetch me activities',
            security: [{ bearerAuth: [] }],
            tags: ['activity'],
            response: {
                200: SCHEMA_ACTIVITIES_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const activities = await prisma.activity.findMany({
                where: {
                    user_id: request.user?.id
                }
            })
            return activities
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    });

    fastify.get('/:id', {
        preHandler: [authenticate, activityAuthorization],
        schema: {
            description: 'Fetch activity',
            security: [{ bearerAuth: [] }],
            tags: ['activity'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            response: {
                200: SCHEMA_ACTIVITY_RETURN
            }
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string }
        try {
            const activity = await prisma.activity.findFirst({
                where: {
                    id
                },
                include: {
                    user: {
                        select: {
                            display_name: true,
                            avatar_file_key: true
                        }
                    }
                }
            })
            if (!activity) {
                return reply.status(404).send('Activity not found')
            }
            return activity
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    });
    fastify.get('/fetch/source_ids', {
        preHandler: [authenticate],
        schema: {
            description: 'Fetch activities by source id',
            security: [{ bearerAuth: [] }],
            tags: ['activity'],
            response: {
                200: SCHEMA_ACTIVITIES_RETURN
            }
        }
    }, async (request, reply) => {
        const { source_ids } = request.query as { source_ids: string }
        try {
            let ids: string[] = []
            if (source_ids) {
                ids = JSON.parse(source_ids)
            }
            const activities = await prisma.activity.findMany({
                where: {
                    user_id: request.user?.id,
                    source_id: {
                        in: ids.map((item) => item.toString())
                    }
                },
            })
            return activities || []
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    });
}

export default activityRoutes