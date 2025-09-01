import { prisma } from "../../db";
import { randomUUID } from "node:crypto";
import { generateSurvivalDay } from "../survival_day/survival_day.controller";
import { gameConfig, GameConfig } from "../../lib/game_config";
import { Activity, GameDifficulty, GameNotification } from "@prisma/client";

type GameStats = {
    distance_in_meters: number
    elapsed_time_in_seconds: number
    days_not_rested: number
    days_rested: number
}

export async function getGameStats(gameId: string, userId: string): Promise<GameStats> {
    const stats = await prisma.activity.aggregate({
        where: { user_id: userId, survival_day: { game_id: gameId } },
        _sum: {
            elapsed_time_in_seconds: true,
            distance_in_meters: true
        }
    })
    const daysNotRested = await prisma.survivalDay.count({ where: { game_id: gameId, activity_id: { not: null } } })
    const daysRested = await prisma.survivalDay.count({ where: { game_id: gameId, activity_id: null } })
    return { distance_in_meters: stats._sum.distance_in_meters || 0, elapsed_time_in_seconds: stats._sum.elapsed_time_in_seconds || 0, days_not_rested: daysNotRested, days_rested: daysRested }
}

export async function getUnseenGameNotifications(gameId: string, userId: string): Promise<GameNotification[]> {
    const notifications = await prisma.gameNotification.findMany({
        where: { game_id: gameId, game: { user_id: userId }, seen: false }
    })
    return notifications
}

export async function markNotificationsAsSeen(gameId: string, userId: string): Promise<void> {
    await prisma.gameNotification.updateMany({
        where: {
            game_id: gameId,
            game: { user_id: userId }, seen: false
        },
        data: { seen: true }
    })
}

export async function startGame(userId: string, difficulty: string) {
    const gameId = randomUUID()
    const config = gameConfig.difficulty[difficulty as keyof typeof gameConfig.difficulty] as GameConfig
    try {
        const { description, options } = await generateSurvivalDay(1, config, null)
        const [game, characterFull, survivalDay] = await prisma.$transaction([
            prisma.game.create({
                data: {
                    id: gameId,
                    user_id: userId,
                    difficulty: difficulty as GameDifficulty,
                    daily_food_loss: config.dailyFoodLoss,
                    daily_water_loss: config.dailyWaterLoss,
                    min_distance_in_kilometers: config.minDistanceInKilometers,
                    max_distance_in_kilometers: config.maxDistanceInKilometers
                },
                include: {
                    survival_days: true
                }
            }),
            prisma.character.create({
                data: {
                    user_id: userId,
                    game_id: gameId,
                    health: config.health,
                    food: config.food,
                    water: config.water
                }
            }),
            prisma.survivalDay.create({
                data: {
                    game_id: gameId,
                    user_id: userId,
                    day: 1,
                    description: description,
                    options: {
                        create: options
                    }
                }
            })
        ])
        game.survival_days = [survivalDay]
        return game
    } catch (e) {
        console.error(e)
        throw e
    }
}
