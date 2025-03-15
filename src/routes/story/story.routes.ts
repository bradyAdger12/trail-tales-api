import { FastifyPluginAsync } from "fastify";
import _ from "lodash";
import { SCHEMA_STORIES_RETURN, SCHEMA_STORY_RETURN } from "./story.schema";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/authentication";
import { ai } from "../../genkit";
import { ChapterOutputSchema, getHealthDecrement } from "./story.controller";

const storyRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/templates', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch story templates',
            tags: ['story'],
            response: {
                200: SCHEMA_STORIES_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const storyTemplates = await prisma.storyTemplate.findMany()
            return storyTemplates
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.get('/preview/:id', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                }
            },
            description: 'Preview a story',
            tags: ['story'],
            response: {
                200: SCHEMA_STORY_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string }
            const storyTemplate = await prisma.storyTemplate.findFirst({
                where: {
                    id
                }
            })
            return storyTemplate
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })
    
    
    fastify.get('/me', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            description: 'Fetch the user\'s current story',
            tags: ['story'],
            response: {
                200: SCHEMA_STORY_RETURN,
                404: { properties: { message: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        try {
            const story = await prisma.story.findFirst({
                where: {
                    user_id: request.user?.id
                },
                include: {
                    chapters: {
                        orderBy: {
                            created_at: 'desc'
                        },
                        select: {
                            id: true,
                            title: true,
                            description: true
                        }
                    }
                }
            })
            if (!story) {
                return reply.status(404).send({ message: 'No story found' })
            }
            return story
        } catch (e) {
            return reply.status(500).send(e as string)
        }
    })

    fastify.post('/start', {
        preHandler: authenticate,
        schema: {
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    story_template_id: { type: 'string' }
                },
                required: ['story_template_id' ]
            },
            description: 'Begin a story',
            tags: ['story'],
            response: {
                200: SCHEMA_STORY_RETURN
            }
        }
    }, async (request, reply) => {
        try {
            const { story_template_id } = request.body as { story_template_id: string }
            const storyTemplate = await prisma.storyTemplate.findFirst({
                where: {
                    id: story_template_id
                },
                select: {
                    title: true,
                    description: true,
                    cover_image_url: true
                }
            })
            if (!storyTemplate) {
                return reply.status(404).send({ message: 'Story could not be started. Not found' })
            }
            const user = await prisma.user.findFirst({
                where: {
                    id: request.user?.id
                },
                select: {
                    id: true,
                    health: true,
                    weekly_distance_in_kilometers: true,
                    threshold_pace_seconds: true
                }
            })
            if (!user?.weekly_distance_in_kilometers) {
                return reply.status(400).send({ message: 'User has not set their weekly distance' })
            }
            if (user?.id) {
                const { output } = await ai.generate({
                    output: { schema: ChapterOutputSchema },
                    system: 'You are a genious storyteller, specializing in suspense and creativity.',
                    prompt: `Create the 1st chapter of the story based on the following title and description for the story.

                    
                    TITLE: ${storyTemplate.title}\n\n
                    DESCRIPTION: ${storyTemplate.description}\n\n


                    The chapter should have a title and description as well as 3 unique actions the user can take based on the chapter plot.
                    `
                });
                if (output && user.weekly_distance_in_kilometers) {
                    const actions = []
                    for (const item of output.actions) {
                        let distanceInMeters = 0
                        if (item.difficulty === 'easy') {
                            distanceInMeters = ((user.weekly_distance_in_kilometers * 1000) / 7) * ((Math.random() * 0.05) + 1)
                        } else if (item.difficulty === 'medium') {
                            distanceInMeters = ((user.weekly_distance_in_kilometers * 1000) / 7) * ((Math.random() * 0.15) + 1.05)
                        } else if (item.difficulty === 'hard') {
                            distanceInMeters = ((user.weekly_distance_in_kilometers * 1000) / 7) * ((Math.random() * 0.10) + 1.20)
                        }

                        actions.push({
                            user_id: user.id,
                            distance_in_meters: distanceInMeters,
                            health: getHealthDecrement(item.difficulty),
                            difficulty: item.difficulty,
                            description: item.action
                        })
                    }
                    const [userUpdate, story] = await prisma.$transaction([
                        prisma.item.deleteMany({
                            where: {
                                user_id: user.id
                            }
                        }),
                        prisma.user.update({
                            where: {
                                id: user.id
                            },
                            data: {
                                health: 100,
                            }
                        }),
                        prisma.story.create({
                            data: {
                                title: storyTemplate.title,
                                description: storyTemplate.description,
                                cover_image_url: storyTemplate.cover_image_url,
                                user_id: user.id,
                                template_id: story_template_id,
                                chapters: {
                                    create: {
                                        title: output.title,
                                        description: output.description,
                                        user_id: user.id,
                                        actions: {
                                            createMany: {
                                                data: actions
                                            }
                                        }
                                    }
                                }
                            },
                            include: {
                                chapters: {
                                    orderBy: {
                                        created_at: 'desc'
                                    },
                                    select: {
                                        created_at: true,
                                        title: true,
                                        description: true,
                                        actions: {
                                            select: {
                                                description: true,
                                                difficulty: true,
                                                health: true,
                                                distance_in_meters: true
                                            }
                                        }
                                    }
                                }
                            }
                        })
                    ])
                    if (!story) {
                        return reply.status(500).send({ message: 'Error creating story' })
                    }
                    return story
                }
            } else {
                return reply.status(401).send({ message: 'You must be authorized to complete this action' })
            }
        } catch (e) {
            return reply.status(500).send({ message: e as string })
        }
    })
}

export default storyRoutes