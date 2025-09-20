import { faker } from "@faker-js/faker";
import { prisma } from "../db";
import { buildServer } from "../server";
import { registerAndLoginUser } from "../test/setup";
import { FastifyInstance } from "fastify";
import { startGame } from "../routes/game/game.controller";
import { Activity, Game } from "@prisma/client";
import { GameConfig, gameConfig } from "../lib/game_config";
import { processDay } from "../routes/activity/activity.controller";
import dotenv from 'dotenv'
import { DAYS_TO_SURVIVE } from "../lib/constants";
import { advanceSurvivalDay, hardActionDuration, mediumActionDuration, easyActionDuration } from "../routes/survival_day/survival_day.controller";
dotenv.config({ path: '.env.test' })

let lostGames = 0
let wonGames = 0
const REST_ACTIVITIES = 17
const EASY_ACTIVITIES = 4
const MEDIUM_ACTIVITIES = 0
const HARD_ACTIVITIES = 0
const DAILY_FOOD_LOSS = Number(process.argv[3])
const DAILY_WATER_LOSS = Number(process.argv[4])
const SIMULATIONS = Number(process.argv[5]) || 30

gameConfig.difficulty.easy.dailyFoodLoss = DAILY_FOOD_LOSS
gameConfig.difficulty.easy.dailyWaterLoss = DAILY_WATER_LOSS
gameConfig.difficulty.medium.dailyFoodLoss = DAILY_FOOD_LOSS
gameConfig.difficulty.medium.dailyWaterLoss = DAILY_WATER_LOSS
gameConfig.difficulty.hard.dailyFoodLoss = DAILY_FOOD_LOSS
gameConfig.difficulty.hard.dailyWaterLoss = DAILY_WATER_LOSS

function getDuration(difficulty: string, game: Pick<Game, 'min_duration_in_seconds' | 'max_duration_in_seconds'>) {
    switch (difficulty) {
        case 'easy':
            return easyActionDuration(game)
        case 'medium':
            return mediumActionDuration(game)
        case 'hard':
            return hardActionDuration(game)
        default:
            return 0
    }
}

async function startSimulation() {
    await prisma.user.deleteMany()
    const difficulty = process.argv[2]
    if (!difficulty) {
        throw new Error('Difficulty is required')
    }
    const fastify = await buildServer()
   
    const promises = []
    for (let i = 0; i < SIMULATIONS; i++) {
        promises.push(runSimulation(fastify, difficulty))
    }
    try {
        await Promise.all(promises)
        console.log(`Win percentage: ${(wonGames / (lostGames + wonGames) * 100).toFixed(2)}%`)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.user.deleteMany()
    }
}

async function runSimulation(fastify: FastifyInstance, difficulty: string) {
    try {
        const restDays = Array.from({ length: REST_ACTIVITIES }, () => 'rest')
        const easyDays = Array.from({ length: EASY_ACTIVITIES }, () => 'easy')
        const mediumDays = Array.from({ length: MEDIUM_ACTIVITIES }, () => 'medium')
        const hardDays = Array.from({ length: HARD_ACTIVITIES }, () => 'hard')
        const activityDurations = [...restDays, ...easyDays, ...mediumDays, ...hardDays]
        const { token, user } = await registerAndLoginUser(fastify)
        let game = null
        await startGame(user.id, difficulty)
        for (let i = 0; i < DAYS_TO_SURVIVE; i++) {
            game = await prisma.game.findFirst({
                where: {
                    user_id: user.id
                }
            })
            if (game?.status === 'lost') {
                break
            }
            const randomIndex = Math.floor(Math.random() * activityDurations.length)
            const randomActivityDuration = activityDurations[randomIndex]
            if (randomActivityDuration !== 'rest') {
                const activityJson = {
                    user_id: user.id,
                    distance_in_meters: 1000,
                    elapsed_time_in_seconds: getDuration(randomActivityDuration, game!),
                    source: 'strava',
                    source_id: faker.string.uuid(),
                    polyline: '',
                    name: faker.lorem.word(),
                } as Activity
                const activity = await prisma.activity.create({
                    data: activityJson,
                })
                await processDay(user, activity)
            }
            await advanceSurvivalDay(game!)
            activityDurations.splice(randomIndex, 1)
        }
        if (game?.status === 'lost') {
            lostGames++
        } else {
            wonGames++
        }
    } catch (e) {
        throw e
    }

}

startSimulation()