import { Character, Difficulty } from "@prisma/client";
import { prisma } from "../../db";
import { randomUUID } from "node:crypto";
import { ai } from "../../genkit";
import { z } from "zod";

const OptionSchema = z.object({
    description: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard'])
})

const OutputSchema = z.object({
    description: z.string(),
    options: z.array(OptionSchema)
})


type Option = z.infer<typeof OptionSchema> & {
    distance_in_kilometers?: number
}


function addDistancesToOptions(options: Option[], weekly_distance_in_kilometers: number) {
    options.forEach(option => {
        if (option.difficulty === 'easy') {
            option.distance_in_kilometers = weekly_distance_in_kilometers * (0.10 + Math.random() * 0.08)
        } else if (option.difficulty === 'medium') {
            option.distance_in_kilometers = weekly_distance_in_kilometers * (0.20 + Math.random() * 0.10)
        } else if (option.difficulty === 'hard') {
            option.distance_in_kilometers = weekly_distance_in_kilometers * (0.33 + Math.random() * 0.05)
        }
    })
}

export async function generateStory(day: number, character: Character) {
    const response = await ai.generate({
        system: `
        You are a video game storyteller tasked with crafting an unforgettable adventure for a player. The preface to the story is a plane has crash on a remote island and you are the only survivor. You must survive the island for the next 21 days before help arrives.
        `,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Create a story for the day ${day} for the character ${character.name}. The description for the day should be kept to 2 paragraphs. The output should be in markdown format. I'd like the format to look like a text adventure game.\n\n
                        
                        ## Day ${day}

                        Description of the day....\n\n

                        You should also provide 3 options for the player to choose from. The options should be in the format of a text adventure game.

                        `
                    }
                ]
            }
        ],
        output: { schema: OutputSchema } 
    });
    return response.output!
}

export async function startGame(userId: string, weekly_distance_in_kilometers: number, threshold_pace_minutes: number, threshold_pace_seconds: number, character: Character) {
    const gameId = randomUUID()
    try {
        const { description, options } = await generateStory(1, character)
        addDistancesToOptions(options as Option[], weekly_distance_in_kilometers)
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
                    description: description,
                    options: options
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
