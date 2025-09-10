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

async function processResourceEffects({ user, option, activity, survivalDay }: { user: User, option: SurvivalDayOption, activity: Activity, survivalDay: SurvivalDay & { options: SurvivalDayOption[] } }) {
    let foundFood = false
    let foundWater = false
    let injurySustained = false
    const oddsToFindWater = Math.random() * 100
    const oddsToFindFood = Math.random() * 100
    const oddsOfInjury = Math.random() * 100
    foundFood = oddsToFindFood < option.chance_to_find_items
    foundWater = oddsToFindWater < option.chance_to_find_items
    injurySustained = oddsOfInjury < option.chance_to_find_items
    const character = await prisma.character.findFirst({
        where: {
            user_id: user.id
        }
    })
    if (!character) {
        throw new Error('Character not found')
    }
    const characterFood = Math.min(character.food + (foundFood ? option.item_gain_percentage : 0), 100)
    const characterWater = Math.min(character.water + (foundWater ? option.item_gain_percentage : 0), 100)
    const characterHealth = Math.min(character.health + (injurySustained ? option.health_change_percentage : 0), 100)
    const transaction: any[] = [
        prisma.character.update({
            where: {
                user_id: user.id
            },
            data: {
                food: characterFood,
                water: characterWater,
                health: characterHealth
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
    if (foundFood) {
        transaction.push(prisma.gameNotification.create({
            data: {
                game_id: survivalDay.game_id,
                description: 'You found food!',
                resource: 'food',
                resource_change_as_percent: option.item_gain_percentage,
                day: survivalDay.day
            }
        }))
    }
    if (foundWater) {
        transaction.push(prisma.gameNotification.create({
            data: {
                game_id: survivalDay.game_id,
                description: 'You found water!',
                resource: 'water',
                resource_change_as_percent: option.item_gain_percentage,
                day: survivalDay.day
            }
        }))
    }
    if (injurySustained) {
        transaction.push(prisma.gameNotification.create({
            data: {
                game_id: survivalDay.game_id,
                description: 'You sustained an injury!',
                resource: 'health',
                resource_change_as_percent: -10,
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