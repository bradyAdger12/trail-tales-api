import { Character, Difficulty } from "@prisma/client";
import { prisma } from "../../db";
import { randomUUID } from "node:crypto";
import { ai } from "../../genkit";

export async function generateStory(day: number, character: Character) {
    const response = await ai.generate({
        system: `
        You are a video game storyteller tasked with crafting an unforgettable adventure for a player.
        `,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Create a story for the day ${day} for the character ${character.name}.`
                    }
                ]
            }
        ]
    });
    return response.text
}

export async function startGame(userId: string, weekly_distance_in_kilometers: number, threshold_pace_minutes: number, threshold_pace_seconds: number, character: Character) {
    const gameId = randomUUID()
    try {
        const story = await generateStory(1, character)
        const [game, characterFull, survivalDay] = await prisma.$transaction([
            prisma.game.create({
                data: {
                    id: gameId,
                    user_id: userId,
                }
            }),
            prisma.character.create({
                data: {
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
                    day: 1,
                    description: story
                }
            })
        ])
        return game
    } catch (e) {
        console.error(e)
        throw e
    }
}
