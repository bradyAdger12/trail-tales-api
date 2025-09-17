import { SurvivalDay, SurvivalDayOption, User } from "@prisma/client"
import { Activity } from "@prisma/client"
import { prisma } from "../../db"

function toLocalDate(date: Date, timezone: string) {
    const dateObject = new Date(date)
    return dateObject.toLocaleString('en-US', { timeZone: timezone }).split(',')[0]
}

function findCompletedOption(survivalDay: SurvivalDay & { options: SurvivalDayOption[] }, activity: Activity) {
    const activityDurationInSeconds = activity.elapsed_time_in_seconds
    const matchingOption = survivalDay.options
        .filter(option => activityDurationInSeconds >= option.duration_in_seconds).sort((a, b) => b.duration_in_seconds - a.duration_in_seconds)[0]
    return matchingOption
}

async function processResourceEffects({ user, option, activity, survivalDay }: { user: User, option: SurvivalDayOption, activity: Activity, survivalDay: SurvivalDay & { options: SurvivalDayOption[] } }) {
   
    const character = await prisma.character.findFirst({
        where: {
            user_id: user.id
        }
    })
    if (!character) {
        throw new Error('Character not found')
    }
    const transaction: any[] = [
        prisma.character.update({
            where: {
                user_id: user.id
            },
            data: {
                food: { 
                    increment: option.food_gain_percentage || 0
                },
                water: { 
                    increment: option.water_gain_percentage || 0
                },
                health: {
                    increment: option.health_gain_percentage || 0
                }
            }
        }),
        prisma.survivalDay.update({
            where: {
                id: option.survival_day_id
            },
            data: {
                activity_id: activity.id,
                completed_difficulty: option.difficulty
            }
        })
    ]
    if (option.food_gain_percentage > 0) {
        transaction.push(prisma.gameNotification.create({
            data: {
                game_id: survivalDay.game_id,
                description: option.description,
                resource: 'food',
                resource_change_as_percent: option.food_gain_percentage,
                day: survivalDay.day
            }
        }))
    }
    if (option.water_gain_percentage > 0) {
        transaction.push(prisma.gameNotification.create({
            data: {
                game_id: survivalDay.game_id,
                description: option.description,
                resource: 'water',
                resource_change_as_percent: option.water_gain_percentage,
                day: survivalDay.day
            }
        }))
    }
    if (option.health_gain_percentage > 0) {
        transaction.push(prisma.gameNotification.create({
            data: {
                game_id: survivalDay.game_id,
                description: option.description,
                resource: 'health',
                resource_change_as_percent: option.health_gain_percentage,
                day: survivalDay.day
            }
        }))
    }
    await prisma.$transaction(transaction)
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
        if (survivalDay.activity_id) { // If the survival day has an activity, we don't need to process another activity
            return
        }
        const survivalDaySpan = toLocalDate(new Date(survivalDay.created_at), user.timezone)
        if (activityDay === survivalDaySpan) {
            const option: SurvivalDayOption | null = findCompletedOption(survivalDay, activity)
            if (option) {
                try {
                    await processResourceEffects({ user, option, activity, survivalDay })
                } catch (error) {
                    throw new Error('~~ Error processing day: ' + error)
                }
            }
        }
    }
}