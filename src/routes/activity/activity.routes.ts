import { FastifyPluginAsync } from "fastify"
import { SCHEMA_ACTIVITIES_RETURN, SCHEMA_ACTIVITY_RETURN } from "./activity.schema";
import { Activity } from "@prisma/client";
import { prisma } from "../../server";
import { authenticate } from "../../middleware/authentication";
import { activityAuthorization } from "../../middleware/authorize_activity";

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
                    source_id: { type: 'string' },
                    distance_in_meters: { type: 'number' },
                    elapsed_time_in_seconds: { type: 'number' }
                },
                required: ['name', 'polyline', 'source', 'source_id', 'distance_in_meters', 'elapsed_time_in_seconds']
            },
            response: {
                201: SCHEMA_ACTIVITY_RETURN
            }
        }
    }, async (request, reply) => {
        const { name, polyline, source, source_id, distance_in_meters, elapsed_time_in_seconds } = request.body as Activity

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
            const activity = await prisma.activity.create({
                data: {
                    name,
                    user_id: request.user.id,
                    polyline,
                    source,
                    source_id,
                    distance_in_meters,
                    elapsed_time_in_seconds
                }
            })
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
            // if (activity.user_id != request.user?.id) {
            //     return {...activity}
            // }
            return activity
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    });
    fastify.get('/fetch/source_ids', {
        preHandler: [authenticate, activityAuthorization],
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