import { Character, Game, SurvivalDay, SurvivalDayOption, User } from "@prisma/client"
import { ai } from "../../genkit"
import { z } from "zod"
import { prisma } from "../../db"
import { gameConfig, GameConfig } from "../../lib/game_config"

const OptionSchema = z.object({
    description: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'rest'])
})

const OutputSchema = z.object({
    description: z.string(),
    options: z.array(OptionSchema)
})

type Option = z.infer<typeof OptionSchema> & SurvivalDayOption

function addPreviousDayDescription(previous_day: SurvivalDay & { options: SurvivalDayOption[] } | null) {
    if (!previous_day) {
        return ''   
    }
    const selectedOption = previous_day.options.find(option => option.difficulty === previous_day.completed_difficulty)
    return `Previous day: ${previous_day.description}\n\n
    ${selectedOption ? `User response: ${selectedOption.description}` : 'Decided to sit next to the fire and rest.'}
    `
}

function addDistancesToOptions(options: Option[], config: GameConfig) {
    options.forEach(option => {
        if (option.difficulty === 'easy') {
            option.distance_in_kilometers = config.minDistanceInKilometers + ((config.maxDistanceInKilometers - config.minDistanceInKilometers) * (Math.random() * 0.25))
            option.chance_to_find_items = 50
        } else if (option.difficulty === 'medium') {
            option.distance_in_kilometers = config.minDistanceInKilometers + ((config.maxDistanceInKilometers - config.minDistanceInKilometers) * (0.40 + Math.random() * 0.35))
            option.chance_to_find_items = 75
        } else if (option.difficulty === 'hard') {
            option.distance_in_kilometers = config.minDistanceInKilometers + ((config.maxDistanceInKilometers - config.minDistanceInKilometers) * (0.80 + Math.random() * 0.20))
            option.chance_to_find_items = 90
        } else if (option.difficulty === 'rest') {
            option.distance_in_kilometers = 0
            option.chance_to_find_items = 0
            option.health_change_percentage = 5
        }
    })
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
            options: true
        }
    })
    if (!currentSurvivalDay) {
        return
    }
    const hasActivity = !!currentSurvivalDay.activity_id
    const nextDay = currentSurvivalDay.day + 1
    const { description, options } = await generateSurvivalDay(nextDay, gameConfig.difficulty[game.difficulty], currentSurvivalDay)
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
    }
    if (waterLevel <= 0) {
        totalHealthDelta -= 10
    }
    
    //If there is no activity, the user rested and should gain health
    if (!hasActivity) {
        const restOption = options.find(option => option.difficulty === 'rest')
        if (restOption) {
            totalHealthDelta += restOption.health_change_percentage
        }
    }

    const healthLevel = Math.max(0, character.health + totalHealthDelta)
    
    const transactions = [
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
    ]
    if (!hasActivity) {
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
                        text: `Create a story for the day ${day}. The description for the day should be kept to 1 paragraph. The output should be in markdown format. I'd like the format to look like a text adventure game.\n\n

                        ${day > 1 ? `Make the story a continuation of the previous day:\n\n${addPreviousDayDescription(previous_day)}` : ''}

                        You should also provide 4 options for the player to choose from. The options should be in the format of a text adventure game. \n\n

                        ## Options

                        Easy Option: This option should be easy for the survivor to complete.\n
                        Medium Option: This option should be medium for the survivor to complete.\n
                        Hard Option: This option should be hard for the survivor to complete.\n
                        Rest Option: This option should be a rest day.\n
                        
                        Tell the story in second person.

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