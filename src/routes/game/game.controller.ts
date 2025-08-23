import { prisma } from "../../db";
import { randomUUID } from "node:crypto";
import { generateSurvivalDay } from "../survival_day/survival_day.controller";
import { gameConfig, GameConfig } from "../../lib/game_config";
import { GameDifficulty } from "@prisma/client";

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
