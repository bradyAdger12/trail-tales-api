import { Game, SurvivalDayOption } from "@prisma/client"
import { prisma } from "../../db"
import { easyStoryOptions, gameConfig, GameConfig, hardStoryOptions, mediumStoryOptions, restStoryOptions } from "../../lib/game_config"

function getRandomValue(min: number, max: number) {
    return Math.floor(min + (max - min) * Math.random())
}

function getRandomDistance(min: number, max: number, percentage: number) {
    return Math.floor(min + ((max - min) * (Math.random() * percentage)))
}

export async function generateNextDayOptions(config: GameConfig) {
    const options: Partial<SurvivalDayOption>[] = []
    const easyOption = easyStoryOptions[Math.floor(Math.random() * easyStoryOptions.length)]
    const mediumOption = mediumStoryOptions[Math.floor(Math.random() * mediumStoryOptions.length)]
    const hardOption = hardStoryOptions[Math.floor(Math.random() * hardStoryOptions.length)]
    const restOption = restStoryOptions[Math.floor(Math.random() * restStoryOptions.length)]
    options.push({
        difficulty: 'easy',
        description: easyOption.name,
        food_gain_percentage: easyOption.canFindFood ? getRandomValue(5, 7) : 0,
        water_gain_percentage: easyOption.canFindWater ? getRandomValue(5, 7) : 0,
        health_gain_percentage: easyOption.canFindHealth ? getRandomValue(5, 7) : 0,
        distance_in_kilometers: getRandomDistance(config.minDistanceInKilometers, config.maxDistanceInKilometers, 0.25)
    })
    options.push({
        difficulty: 'medium',
        description: mediumOption.name,
        food_gain_percentage: mediumOption.canFindFood ? getRandomValue(8, 10) : 0,
        water_gain_percentage: mediumOption.canFindWater ? getRandomValue(8, 10) : 0,
        health_gain_percentage: mediumOption.canFindHealth ? getRandomValue(8, 10) : 0,
        distance_in_kilometers: getRandomDistance(config.minDistanceInKilometers, config.maxDistanceInKilometers, 0.70)
    })
    options.push({
        difficulty: 'hard',
        description: hardOption.name,
        food_gain_percentage: hardOption.canFindFood ? getRandomValue(10, 15) : 0,
        water_gain_percentage: hardOption.canFindWater ? getRandomValue(10, 15) : 0,
        health_gain_percentage: hardOption.canFindHealth ? getRandomValue(10, 15) : 0,
        distance_in_kilometers: getRandomDistance(config.minDistanceInKilometers, config.maxDistanceInKilometers, 0.90)
    })
    options.push({
        difficulty: 'rest',
        description: restOption.name,
        food_gain_percentage: 0,
        water_gain_percentage: 0,
        health_gain_percentage: Math.floor(Math.random() * 5) + 3,
        distance_in_kilometers: 0
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
    const options = await generateNextDayOptions(gameConfig.difficulty[game.difficulty])
    const character = await prisma.character.findUnique({
        where: {
            user_id: game.user_id
        }
    })
    if (!character) {
        return
    }

    // Calculate food and water levels based on game configuration
    const foodLevel = Math.max(0, character.food - gameConfig.difficulty[game.difficulty].dailyFoodLoss)
    const waterLevel = Math.max(0, character.water - gameConfig.difficulty[game.difficulty].dailyWaterLoss)
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

    //If there is no activity, the user rested and should gain health
    if (!hasActivity) {
        const restOption = options.find(option => option.difficulty === 'rest')
        if (restOption) {
            totalHealthDelta += restOption.health_gain_percentage ?? 0
        }
    }

    const healthLevel = Math.min(100, Math.max(0, character.health + totalHealthDelta))

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
                food: foodLevel,
                water: waterLevel,
                health: healthLevel
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
                resource_change_as_percent: options.find(option => option.difficulty === 'rest')?.health_gain_percentage ?? 0
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
    await prisma.$transaction(transactions)

}