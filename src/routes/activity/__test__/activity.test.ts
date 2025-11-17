import { options, test } from 'tap'
import buildServer from '../../../server'
import { prisma } from '../../../db'
import { SurvivalDay, SurvivalDayOption, User } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { startGame } from '../../game/game.controller'
import { registerAndLoginUser } from '../../../test/setup'
import { processDay } from '../activity.controller'
import { faker } from '@faker-js/faker'
import { getDuration } from '../../survival_day/survival_day.controller'
import _ from 'lodash'

let fastify: FastifyInstance
let users: User[] = []
test('activities', async (t) => {

    t.before(async () => {
        fastify = await buildServer()
    })

    t.teardown(async () => {
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: users.map(user => user.id)
                }
            }
        })
        await fastify.close()
        await prisma.$disconnect()
    })

    await t.test('activity counts as rest', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        const activity = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: 60,
                source: 'test',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        await processDay(user, activity)
        const survivalDay = await prisma.survivalDay.findFirst({
            where: {
                game_id: game.id
            }
        })
        t.same(survivalDay?.completed_difficulty, 'rest')
    }).catch(e => {
        console.error(e)
    })

    await t.test('activity counts as easy', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        const options = (game.survival_days[0] as SurvivalDay & { options: SurvivalDayOption[] }).options
        const activity = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: options.find(option => option.difficulty === 'easy')?.duration_in_seconds!,
                source: 'strava',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        await processDay(user, activity)
        const survivalDay = await prisma.survivalDay.findFirst({
            where: {
                game_id: game.id
            }
        })
        t.same(survivalDay?.completed_difficulty, 'easy')
    }).catch(e => {
        console.error(e)
    })

    await t.test('activity counts as medium', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'medium')
        const options = (game.survival_days[0] as SurvivalDay & { options: SurvivalDayOption[] }).options
        const activity = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: options.find(option => option.difficulty === 'medium')?.duration_in_seconds!,
                source: 'strava',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        await processDay(user, activity)
        const survivalDay = await prisma.survivalDay.findFirst({
            where: {
                game_id: game.id
            }
        })
        t.same(survivalDay?.completed_difficulty, 'medium')
    }).catch(e => {
        console.error(e)
    })

    await t.test('activity counts as hard', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'hard')
        const options = (game.survival_days[0] as SurvivalDay & { options: SurvivalDayOption[] }).options
        const activity = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: options.find(option => option.difficulty === 'hard')?.duration_in_seconds!,
                source: 'strava',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        await processDay(user, activity)
        const survivalDay = await prisma.survivalDay.findFirst({
            where: {
                game_id: game.id
            }
        })
        t.same(survivalDay?.completed_difficulty, 'hard')
    }).catch(e => {
        console.error(e)
    })

    await t.test('activity results in rewards', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'hard')
        const options = (game.survival_days[0] as SurvivalDay & { options: SurvivalDayOption[] }).options
        const hardOption = options.find(option => option.difficulty === 'hard')!
        const initialCharacter = await prisma.character.findFirst({
            where: {
                user_id: user.id
            }
        })
        if (!initialCharacter) {
            throw new Error('Character not found')
        }
        const activity = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: hardOption.duration_in_seconds,
                source: 'strava',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        await processDay(user, activity)
        const character = await prisma.character.findFirst({
            where: {
                user_id: user.id
            }
        })
        if (!character) {
            throw new Error('Character not found')
        }
        t.same(character.food, initialCharacter.food + hardOption.food_gain_percentage)
        t.same(character.water, initialCharacter.water + hardOption.water_gain_percentage)
        t.same(character.health, initialCharacter.health + hardOption.health_gain_percentage)
    }).catch(e => {
        console.error(e)
    })

    await t.test('no processing if activity is already processed', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'hard')
        const activity1 = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: game.max_duration_in_seconds,
                source: 'strava',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        const activity2 = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: game.max_duration_in_seconds,
                source: 'strava',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        await processDay(user, activity1)
        await processDay(user, activity2)
        const survivalDay = await prisma.survivalDay.findFirst({
            where: {
                game_id: game.id
            }
        })
        t.same(survivalDay?.activity_id, activity1.id)
    }).catch(e => {
        console.error(e)
    })
})



