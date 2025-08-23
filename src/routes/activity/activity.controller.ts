import { SurvivalDay, SurvivalDayOption, User } from "@prisma/client"
import { Activity } from "@prisma/client"
import { prisma } from "../../db"

function toLocalDate(date: Date, timezone: string) {
    const dateObject = new Date(date)
    return dateObject.toLocaleString('en-US', { timeZone: timezone }).split(',')[0]
}

function findCompletedOption(survivalDay: SurvivalDay & { options: SurvivalDayOption[] }, activity: Activity) {
    const activityDistanceInKm = activity.distance_in_meters / 1000
    const matchingOption = survivalDay.options
        .filter(option => activityDistanceInKm >= option.distance_in_kilometers).sort((a, b) => b.distance_in_kilometers - a.distance_in_kilometers)[0]
    return matchingOption
}

async function handleCharacterUpdates({ user, option, activity, survivalDay }: { user: User, option: SurvivalDayOption, activity: Activity, survivalDay: SurvivalDay & { options: SurvivalDayOption[] } }) {
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
                food: { increment: foundItems ? option.item_gain_percentage : 0 },
                water: { increment: foundItems ? option.item_gain_percentage : 0 }
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
    const activityDay = toLocalDate(activity.source_created_at, user.timezone)
    const game = await prisma.game.findFirst({
        where: {
            user_id: user.id
        },
        include: {
            survival_days: {
                include: {
                    options: true
                },
                orderBy: {
                    day: 'desc'
                }
            }
        }
    })
    if (game?.survival_days && game.survival_days.length > 0) {
        const survivalDay = game.survival_days[0] as SurvivalDay & { options: SurvivalDayOption[] }
        const survivalDaySpan = toLocalDate(new Date(survivalDay.created_at), user.timezone)
        if (activityDay === survivalDaySpan) {
            const option: SurvivalDayOption | null = findCompletedOption(survivalDay, activity)
            if (option) {
                try {
                    await handleCharacterUpdates({ user, option, activity, survivalDay })
                } catch (error) {
                    throw new Error('~~ Error processing day: ' + error)
                }
            }
        }
    }



}