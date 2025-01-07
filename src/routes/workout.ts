import { FastifyPluginAsync } from "fastify"
import { authenticate } from "../middleware/authentication"
import _ from "lodash"
import { prisma } from ".."
import { v4 as uuidv4 } from 'uuid';

export const workoutRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/create', { preHandler: authenticate }, async (request, reply) => {
        const body = request.body as { name: string, description?: string }

        if (!_.has(body, 'name')) {
            return reply.status(500).send('Name is required')
        }
        const name = body.name
        const description = body.description

        if (request.user) {
            const workoutId = uuidv4()
            const workout = await prisma.workout.create({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true
                },
                data: {
                    id: workoutId,
                    name,
                    description,
                    type: "easy",
                    creator_id: request.user.id,
                    UserWorkouts: {
                        create: {
                            user_id: request.user.id
                        }
                    }
                }
            })
            return workout
        }
    })

    fastify.get('/', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params as { id: string }
        if (!id) {
            return reply.status(500).send('Id required')
        }
        if (request.user) {
            const workout = await prisma.workout.findFirst({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    Segments: true,
                    duration: true,
                    isPublic: true,
                    type: true,
                },
                where: {
                    id: {
                        equals: id
                    },
                    OR: [
                        {
                            creator_id: {
                                equals: request.user.id
                            }
                        },
                        {
                            isPublic: {
                                equals: true
                            }
                        }
                    ]
                }
            })
            if (workout) {
                return reply.status(200).send(workout)
            } else {
                return reply.status(404).send("Workout not found")
            }
        }
    })

    fastify.get('/:id', { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params as { id: string }
        if (!id) {
            return reply.status(500).send('Id required')
        }
        if (request.user) {
            const workout = await prisma.workout.findFirst({
                select: {
                    id: true,
                    name: true,
                    description: true,
                    Segments: true,
                    duration: true,
                    isPublic: true,
                    type: true,
                },
                where: {
                    id: {
                        equals: id
                    },
                    OR: [
                        {
                            creator_id: {
                                equals: request.user.id
                            }
                        },
                        {
                            isPublic: {
                                equals: true
                            }
                        }
                    ]
                }
            })
            if (workout) {
                return reply.status(200).send(workout)
            } else {
                return reply.status(404).send("Workout not found")
            }
        }
    })
}

// Fetch workouts that I own or I am using
export const workoutsRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
        const user = request.user
        const query = request.query as { limit?: 10, offset?: 0 }
        const limit = query.limit
        const offset = query.offset
        const workouts = await prisma.userWorkout.findMany({
            skip: offset,
            take: limit,
            where: {
                user_id: user?.id
            },
            select: {
                Workout: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        creator_id: true,
                        creator: {
                            select: {
                                display_name: true
                            }
                        }
                    }
                }
            }
        })
        return workouts.flatMap((item) => item.Workout)
    })
}