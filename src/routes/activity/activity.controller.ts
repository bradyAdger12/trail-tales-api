import { User, Activity, Item } from "@prisma/client"
import { prisma } from "../../db"
import { ai } from "../../genkit"
import { ChapterOutputSchema, getHealthDecrement } from "../story/story.controller"

//write a function that gives a percentage difference between two numbers
export const getPercentageDifference = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100
}

export const processChapter = async (user: User, activity: Activity) => {
    let items: Item[] = []
    const story = await prisma.story.findFirst({
        where: {
            user_id: user.id
        },
        include: {
            chapters: {
                select: {
                    activity_id: true,
                    title: true,
                    description: true,
                    id: true,
                    actions: true
                }
            }
        }
    })
    if (!story) {
        return
    }
    const chapter = story?.chapters.find((chapter) => chapter.activity_id === null)
    if (!chapter) {
        return
    }
    const actions = chapter?.actions
    const action = actions?.find((action) => action.selected)
    if (action) {
        const percentageDifference = getPercentageDifference(activity.distance_in_meters, action.distance_in_meters)
        let healthDecrement = action.health
        if (percentageDifference < 0) {
            const multiplier = Math.abs(percentageDifference) / 100 + 2;
            healthDecrement = Math.floor(healthDecrement * multiplier);
        }
        const { output } = await ai.generate({
            output: { schema: ChapterOutputSchema },
            system: 'You are a genious storyteller, specializing in suspense and creativity.',
            prompt: `Create the next chapter of the story based on the following information.
            
            STORY TITLE: ${story.title}\n\n
            STORY DESCRIPTION: ${story.description}\n\n.

            Here is where the story has gone so far:

            ${story.chapters.map((chapter) => `CHAPTER TITLE: ${chapter.title}\n\nCHAPTER DESCRIPTION: ${chapter.description}\n\n CHAPTER ACTIONS: ${chapter.actions.map((action) => `ACTION TAKEN: ${action.description}\n\n`).join('\n\n')}`).join('\n\n')}

            The chapter should have a title and description as well as 3 unique actions the user can take based on the chapter plot.\n\n

            Based on the difficulty of the action, the user has a chance of finding an item along their journey that can either increase their health or reduce the distance of their next journey.

            The user completed an ${action.difficulty} action, so the odds of finding an item are ${action.difficulty === 'easy' ? '10%' : action.difficulty === 'medium' ? '30%' : '50%'}

            If a health item is found, it's value should range between 3 and 7 based on the difficulty of the action.

            If a distance item is found, it's value should range between 500 and 2000 meters based on the difficulty of the action.
            `
        });
        if (!output) {
            return
        }
        const actions = []
        items = output.items.map((item) => { return {...item, user_id: user.id }}) as Item[]
        const distance = ((user.weekly_distance_in_kilometers || 5) * 1000) / 7
        for (const item of output.actions) {
            let distanceInMeters = 0
            if (item.difficulty === 'easy') {
                distanceInMeters = distance * ((Math.random() * 0.05) + 1)
            } else if (item.difficulty === 'medium') {
                distanceInMeters = distance * ((Math.random() * 0.15) + 1.05)
            } else if (item.difficulty === 'hard') {
                distanceInMeters = distance * ((Math.random() * 0.10) + 1.20)
            }

            actions.push({
                user_id: user.id,
                distance_in_meters: distanceInMeters,
                health: getHealthDecrement(item.difficulty),
                difficulty: item.difficulty,
                description: item.action
            })
        }
        await prisma.$transaction([
            prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    health: {
                        increment: healthDecrement
                    }
                }
            }),
            prisma.item.createMany({
                data: [...items]
            }),
            prisma.chapter.update({
                where: {
                    id: chapter?.id
                },
                data: {
                    activity_id: activity.id
                }
            }),
            prisma.chapter.create({
                data: {
                    title: output.title,
                    description: output.description,
                    story_id: story.id,
                    user_id: user.id,
                    actions: {
                        createMany: {
                            data: actions
                        }
                    }
                }
            })
        ])
    }
    return {
        items
    }
}
