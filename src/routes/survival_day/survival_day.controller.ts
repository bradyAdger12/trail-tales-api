import { Character, Game, SurvivalDay, SurvivalDayOption, User    } from "@prisma/client"
import { ai } from "../../genkit"
import { z } from "zod"
import { prisma } from "../../db"
import { gameConfig, GameConfig } from "../../lib/game_config"

const OptionSchema = z.object({
    description: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard'])
})

const OutputSchema = z.object({
    description: z.string(),
    options: z.array(OptionSchema)
})

type Option = z.infer<typeof OptionSchema> & SurvivalDayOption

// function addPreviousDayDescription(previous_day: SurvivalDay & { options: SurvivalDayOption[] } | null) {
//     if (!previous_day) {
//         return ''   
//     }
//     let userResponse = null
//     const options = previous_day.options.filter(option => option.activity_id !== null)
//     if (options.length > 0) {
//         userResponse = options[0]
//     }
//     return `Previous day: ${previous_day.description}\n\n
//     ${userResponse ? `User response: ${userResponse.description}` : 'Decided to sit next to the fire and rest.'}
//     `
// }

function addDistancesToOptions(options: Option[], config: GameConfig) {
    options.forEach(option => {
        if (option.difficulty === 'easy') {
            option.distance_in_kilometers = config.minDistanceInKilometers + ((config.maxDistanceInKilometers - config.minDistanceInKilometers) * (Math.random() * 0.25))
            option.chance_to_find_items = 10
        } else if (option.difficulty === 'medium') {
            option.distance_in_kilometers = config.minDistanceInKilometers + ((config.maxDistanceInKilometers - config.minDistanceInKilometers) * (0.40 + Math.random() * 0.35))
            option.chance_to_find_items = 50
        } else if (option.difficulty === 'hard') {
            option.distance_in_kilometers = config.minDistanceInKilometers + ((config.maxDistanceInKilometers - config.minDistanceInKilometers) * (0.80 + Math.random() * 0.20))
            option.chance_to_find_items = 80
        }
    })
}

export async function advanceSurvivalDay(game: Game) {
    const survivalDay = await prisma.survivalDay.findFirst({
        where: {
            game_id: game.id
        },
        orderBy: {
            day: 'desc'
        },
        include: {
            options: true
        }
    })
    if (!survivalDay) {
        return
    }
    const nextDay = survivalDay.day + 1
    const { description, options } = await generateSurvivalDay(nextDay, gameConfig.difficulty[game.difficulty], survivalDay)
    const character = await prisma.character.findUnique({
        where: {
            user_id: game.user_id
        }
    })
    if (!character) {
        return
    }
    const foodLevel = Math.max(0, character.food - gameConfig.difficulty[game.difficulty].dailyFoodLoss)
    const waterLevel = Math.max(0, character.water - gameConfig.difficulty[game.difficulty].dailyWaterLoss)
    let totalHealthLoss = 0
    if (foodLevel <= 0) {
        totalHealthLoss += 10
    }
    if (waterLevel <= 0) {
        totalHealthLoss += 10
    }
    const healthLevel = Math.max(0, character.health - totalHealthLoss)
    await prisma.$transaction([
        prisma.survivalDay.create({
            data: {
                user_id: game.user_id,
                game_id: game.id,
                day: nextDay,
                description,
                options: {
                    create: options
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
    
}

export async function generateSurvivalDay(day: number, config: GameConfig, previous_day: SurvivalDay & { options: SurvivalDayOption[] } | null): Promise<{ description: string, options: Option[] }> {
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
                        text: `Create a story for the day ${day}. The description for the day should be kept to 2 paragraphs. The output should be in markdown format. I'd like the format to look like a text adventure game.\n\n

                        ## Day ${day}

                        Description of the day....\n\n

                        You should also provide 3 options for the player to choose from. The options should be in the format of a text adventure game. Tell the story in second person.

                        `
                    }
                ]
            }
        ],
        output: { schema: OutputSchema } 
    });
    const options = response.output!.options as Option[]
    addDistancesToOptions(options, config)
    return { description: response.output!.description, options }
}