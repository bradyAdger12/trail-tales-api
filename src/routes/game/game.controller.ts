import { Character, Difficulty, SurvivalDayOption } from "@prisma/client";
import { prisma } from "../../db";
import { randomUUID } from "node:crypto";
import { ai } from "../../genkit";
import { z } from "zod";
import { generateSurvivalDay } from "../survival_day/survival_day.controller";

export async function startGame(userId: string, weekly_distance_in_kilometers: number, threshold_pace_minutes: number, threshold_pace_seconds: number, character: Character) {
    const gameId = randomUUID()
    try {
        const { description, options } = await generateSurvivalDay(1, character, weekly_distance_in_kilometers, null)
        const [game, characterFull, survivalDay] = await prisma.$transaction([
            prisma.game.create({
                data: {
                    id: gameId,
                    user_id: userId,
                },
                include: {
                    survival_days: true
                }
            }),
            prisma.character.create({
                data: {
                    user_id: userId,
                    game_id: gameId,
                    name: character.name,
                    description: character.description,
                    health: character.health,
                    food: character.food,
                    water: character.water,
                    weekly_distance_in_kilometers: weekly_distance_in_kilometers,
                    threshold_pace_in_seconds: threshold_pace_minutes * 60 + threshold_pace_seconds
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
