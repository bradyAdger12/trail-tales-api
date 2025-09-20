import { Game, SurvivalDayOption } from "@prisma/client"
import { prisma } from "../../db"
import { easyStoryOptions, gameConfig, hardStoryOptions, mediumStoryOptions, overnightEvents, restStoryOptions } from "../../lib/game_config"
import { DAYS_TO_SURVIVE } from "../../lib/constants"
import { capValue } from "../../lib/helper"

const MIN_EASY_FOOD_GAIN = 5
const MIN_EASY_WATER_GAIN = 5
const MIN_EASY_HEALTH_GAIN = 5
const MAX_EASY_FOOD_GAIN = 10
const MAX_EASY_WATER_GAIN = 10
const MAX_EASY_HEALTH_GAIN = 10

const MIN_MEDIUM_FOOD_GAIN = 5
const MIN_MEDIUM_WATER_GAIN = 5
const MIN_MEDIUM_HEALTH_GAIN = 5
const MAX_MEDIUM_FOOD_GAIN = 9
const MAX_MEDIUM_WATER_GAIN = 9
const MAX_MEDIUM_HEALTH_GAIN = 9

const MIN_HARD_FOOD_GAIN = 7
const MIN_HARD_WATER_GAIN = 7
const MIN_HARD_HEALTH_GAIN = 7
const MAX_HARD_FOOD_GAIN = 12
const MAX_HARD_WATER_GAIN = 12
const MAX_HARD_HEALTH_GAIN = 12

function getRandomValue(min: number, max: number) {
    return Math.floor(min + ((max - min) * Math.random()))
}

export function easyActionDuration(game: Pick<Game, 'min_duration_in_seconds' | 'max_duration_in_seconds'>) {
    return game.min_duration_in_seconds!
}

export function mediumActionDuration(game: Pick<Game, 'min_duration_in_seconds' | 'max_duration_in_seconds'>) {
    return game.min_duration_in_seconds! + (60 * getRandomValue(3, 7))
}

export function hardActionDuration(game: Pick<Game, 'min_duration_in_seconds' | 'max_duration_in_seconds'>) {
    return game.min_duration_in_seconds! + (60 * getRandomValue(10, 14))
}

export async function generateNextDayOptions(game: Pick<Game, 'min_duration_in_seconds' | 'max_duration_in_seconds'>) {
    const options: Partial<SurvivalDayOption>[] = []
    const easyOption = easyStoryOptions[Math.floor(Math.random() * easyStoryOptions.length)]
    const mediumOption = mediumStoryOptions[Math.floor(Math.random() * mediumStoryOptions.length)]
    const hardOption = hardStoryOptions[Math.floor(Math.random() * hardStoryOptions.length)]
    const restOption = restStoryOptions[Math.floor(Math.random() * restStoryOptions.length)]
    options.push({
        difficulty: 'easy',
        description: easyOption.name,
        food_gain_percentage: easyOption.canFindFood ? getRandomValue(MIN_EASY_FOOD_GAIN, MAX_EASY_FOOD_GAIN) : 0,
        water_gain_percentage: easyOption.canFindWater ? getRandomValue(MIN_EASY_WATER_GAIN, MAX_EASY_WATER_GAIN) : 0,
        health_gain_percentage: easyOption.canFindHealth ? getRandomValue(MIN_EASY_HEALTH_GAIN, MAX_EASY_HEALTH_GAIN) : 0,
        duration_in_seconds: easyActionDuration(game)
    })
    options.push({
        difficulty: 'medium',
        description: mediumOption.name,
        food_gain_percentage: mediumOption.canFindFood ? getRandomValue(MIN_MEDIUM_FOOD_GAIN, MAX_MEDIUM_FOOD_GAIN) : 0,
        water_gain_percentage: mediumOption.canFindWater ? getRandomValue(MIN_MEDIUM_WATER_GAIN, MAX_MEDIUM_WATER_GAIN) : 0,
        health_gain_percentage: mediumOption.canFindHealth ? getRandomValue(MIN_MEDIUM_HEALTH_GAIN, MAX_MEDIUM_HEALTH_GAIN) : 0,
        duration_in_seconds: mediumActionDuration(game)
    })
    options.push({
        difficulty: 'hard',
        description: hardOption.name,
        food_gain_percentage: hardOption.canFindFood ? getRandomValue(MIN_HARD_FOOD_GAIN, MAX_HARD_FOOD_GAIN) : 0,
        water_gain_percentage: hardOption.canFindWater ? getRandomValue(MIN_HARD_WATER_GAIN, MAX_HARD_WATER_GAIN) : 0,
        health_gain_percentage: hardOption.canFindHealth ? getRandomValue(MIN_HARD_HEALTH_GAIN, MAX_HARD_HEALTH_GAIN) : 0,
        duration_in_seconds: hardActionDuration(game)
    })
    options.push({
        difficulty: 'rest',
        description: restOption.name,
        food_gain_percentage: 0,
        water_gain_percentage: 0,
        health_gain_percentage: 3,
        duration_in_seconds: 0
    })

    return options
}

export async function advanceSurvivalDay(game: Game) {
    const currentSurvivalDay = await prisma.survivalDay.findFirst({
        where: {
            game_id: game.id
        },
        orderBy: {
            day: 'desc'
        },
        include: {
            activity: {
                select: {
                    id: true
                }
            },
            options: true,
            game: true
        }
    })
    if (!currentSurvivalDay) {
        return
    }
    let transactions: any[] = []
    const hasActivity = !!currentSurvivalDay.activity_id
    const nextDay = currentSurvivalDay.day + 1
    const options = await generateNextDayOptions(game)
    const character = await prisma.character.findUnique({
        where: {
            user_id: game.user_id
        }
    })
    if (!character) {
        return
    }

    // Calculate food and water levels based on game configuration
    let foodLevel = character.food - gameConfig.difficulty[game.difficulty].dailyFoodLoss
    let waterLevel = character.water - gameConfig.difficulty[game.difficulty].dailyWaterLoss
    let totalHealthDelta = 0
    if (foodLevel <= 0) {
        totalHealthDelta -= 10
        transactions.push(prisma.gameNotification.create({
            data: {
                game_id: game.id,
                description: 'Lost health due to starvation',
                day: nextDay,
                resource: 'health',
                resource_change_as_percent: -10
            }
        }))
    }
    if (waterLevel <= 0) {
        totalHealthDelta -= 10
        transactions.push(prisma.gameNotification.create({
            data: {
                game_id: game.id,
                description: 'Lost health due to dehydration',
                day: nextDay,
                resource: 'health',
                resource_change_as_percent: -10
            }
        }))
    }

    const overnightEvent = overnightEvents[Math.floor(Math.random() * overnightEvents.length)]
    transactions.push(prisma.gameNotification.create({
        data: {
            game_id: game.id,
            description: overnightEvent.name,
            day: nextDay,
            resource: overnightEvent.resource,
            resource_change_as_percent: overnightEvent.resource_change_as_percent
        }
    }))
    if (overnightEvent.resource === 'food') {
        foodLevel += overnightEvent.resource_change_as_percent
    }
    if (overnightEvent.resource === 'water') {
        waterLevel += overnightEvent.resource_change_as_percent
    }
    if (overnightEvent.resource === 'health') {
        totalHealthDelta += overnightEvent.resource_change_as_percent
    }


    //If there is no activity, the user rested and should gain health
    if (!hasActivity) {
        const restOption = options.find(option => option.difficulty === 'rest')
        if (restOption) {
            totalHealthDelta += restOption.health_gain_percentage ?? 0
        }
    }

    const healthLevel = character.health + totalHealthDelta

    if (healthLevel <= 0) {
        transactions.push(prisma.game.update({
            where: {
                id: game.id
            },
            data: {
                status: 'lost'
            }
        }))
    }

    transactions = transactions.concat([
        prisma.gameNotification.create({
            data: {
                game_id: game.id,
                description: 'Daily food loss',
                day: nextDay,
                resource: 'food',
                resource_change_as_percent: -gameConfig.difficulty[game.difficulty].dailyFoodLoss
            }
        }),
        prisma.gameNotification.create({
            data: {
                game_id: game.id,
                description: 'Daily water loss',
                day: nextDay,
                resource: 'water',
                resource_change_as_percent: -gameConfig.difficulty[game.difficulty].dailyWaterLoss
            }
        }),
        prisma.survivalDay.create({
            data: {
                user_id: game.user_id,
                game_id: game.id,
                day: nextDay,
                options: {
                    createMany: {
                        data: options as SurvivalDayOption[]
                    }
                }
            }
        }),
        prisma.character.update({
            where: {
                user_id: game.user_id
            },
            data: {
                food: capValue(foodLevel, 0, 100),
                water: capValue(waterLevel, 0, 100),
                health: capValue(healthLevel, 0, 100)
            }
        })
    ])
    if (!hasActivity) {
        transactions.push(prisma.gameNotification.create({
            data: {
                game_id: game.id,
                description: 'Rested for the day',
                day: nextDay,
                resource: 'health',
                resource_change_as_percent: currentSurvivalDay.options.find(option => option.difficulty === 'rest')?.health_gain_percentage ?? 0
            }
        }))
        transactions.push(prisma.survivalDay.update({
            where: {
                id: currentSurvivalDay.id
            },
            data: {
                completed_difficulty: 'rest'
            }
        }))
    }

    if (currentSurvivalDay.day === DAYS_TO_SURVIVE && healthLevel > 0) {
        transactions.push(prisma.game.update({
            where: {
                id: game.id
            },
            data: {
                status: 'won'
            }
        }))
    }
    await prisma.$transaction(transactions)

}