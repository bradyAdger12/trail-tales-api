import { SurvivalDay, SurvivalDayOption, User } from "@prisma/client"
import { Activity } from "@prisma/client"
import { prisma } from "../../db"

function toLocalDate(date: Date) {
    const dateObject = new Date(date)
    return dateObject.toLocaleString('en-US', { timeZone: 'America/Denver' }).split(',')[0]
}

function findLargestDistanceCompleted(survivalDay: SurvivalDay & { options: SurvivalDayOption[] }, activity: Activity) {
    const activityDistanceInKm = activity.distance_in_meters / 1000
    const matchingOption = survivalDay.options
        .filter(option => activityDistanceInKm >= option.distance_in_kilometers).sort((a, b) => b.distance_in_kilometers - a.distance_in_kilometers)[0]
    return matchingOption
}

async function handleCharacterUpdates(user: User, option: SurvivalDayOption, activity: Activity,) {
    let foundItems = false
    const odds = Math.random() * 100
    if (odds < option.chance_to_find_items) {
        foundItems = true
    }
    await prisma.$transaction([
        prisma.character.update({
            where: {
                user_id: user.id
            },
            data: {
                food: { increment: foundItems ? 10 : 0 },
                water: { increment: foundItems ? 10 : 0 }
            }
        }),
        prisma.survivalDay.update({
            where: {
                id: option.survival_day_id
            },
            data: {
                activity_id: activity.id
            }
        })
    ])
}

export async function processDay(user: User, activity: Activity) {
    const activityDay = toLocalDate(activity.source_created_at)
    const survivalDay = await prisma.survivalDay.findFirst({
        where: {
            user_id: user.id,
        },
        orderBy: {
            day: 'desc'
        },
        include: {
            options: true,
            game: {
                select: {
                    id: true
                }
            }
        }
    })
    if (survivalDay) {
        const survivalDaySpan = toLocalDate(new Date(survivalDay.created_at))
        if (activityDay === survivalDaySpan) {
            const option = findLargestDistanceCompleted(survivalDay, activity)
            if (option) {
                try {
                    await handleCharacterUpdates(user, option, activity)
                } catch (error) {
                    throw new Error('~~ Error processing day: ' + error)
                }
            }
        }
    }



}