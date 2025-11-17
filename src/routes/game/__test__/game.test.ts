import { test } from 'tap'
import buildServer from '../../../server'
import { registerAndLoginUser } from '../../../test/setup'
import { fetchUnseenGameNotifications, getGameStats, startGame } from '../game.controller'
import { prisma } from '../../../db'
import { advanceSurvivalDay, generateNextDayOptions } from '../../survival_day/survival_day.controller'
import { SurvivalDay, SurvivalDayOption, User } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { DAYS_TO_SURVIVE } from '../../../lib/constants'
import { faker } from '@faker-js/faker'
import { processDay } from '../../activity/activity.controller'

let fastify: FastifyInstance
let users: User[] = []
test('games', async (t) => {

    t.setTimeout(1000 * 60 * 10)

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

    await t.test('start game', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        t.hasProps(game, ['id', 'status', 'difficulty', 'max_duration_in_seconds', 'min_duration_in_seconds', 'daily_food_loss', 'daily_water_loss'])
    }).catch(e => {
        console.error(e)
    })

    await t.test('next day created', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        await advanceSurvivalDay(game)
        const nextDay = await prisma.survivalDay.findFirst({
            where: {
                game_id: game.id
            },
            orderBy: {
                day: 'desc'
            }
        })
        t.same(true, nextDay?.day === 2)
    }).catch(e => {
        console.error(e)
    })

    await t.test('game ends when health is 0', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'hard')
        for (let i = 0; i < DAYS_TO_SURVIVE; i++) { // simulate resting for all days
            await advanceSurvivalDay(game)
        }
        const finalGame = await prisma.game.findFirst({
            where: {
                user_id: user.id
            }
        })
        t.same(finalGame?.status, 'lost')
    }).catch(e => {
        console.error(e)
    })

    await t.test('trigger rest when no activity is processed', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'hard')
        await advanceSurvivalDay(game)
        const survivalDay = await prisma.survivalDay.findFirst({
            where: {
                id: game.survival_days[0].id
            }
        })
        t.same(survivalDay?.completed_difficulty, 'rest')
    }).catch(e => {
        console.error(e)
    })

    await t.test('game notifications are created', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'medium')
        await advanceSurvivalDay(game)
        const notifications = await prisma.gameNotification.findMany({
            where: {
                game_id: game.id
            }
        })
        t.ok(notifications.length > 0)
    }).catch(e => {
        console.error(e)
    })

    await t.test('only unseen notifications are returned', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'medium')
        await advanceSurvivalDay(game)
        const notifications = await fetchUnseenGameNotifications(game.id, user.id)
        t.ok(notifications.every(notification => !notification.seen))
    }).catch(e => {
        console.error(e)
    })

    await t.test('fetch game stats', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        const options = await generateNextDayOptions(game)
        const activity = await prisma.activity.create({
            data: {
                user_id: user.id,
                distance_in_meters: 1000,
                elapsed_time_in_seconds: 3600,
                source: 'strava',
                source_id: faker.string.uuid(),
                polyline: 'test',
                name: 'test',
            }
        })
        await prisma.survivalDay.create({
            data: {
                game_id: game.id,
                user_id: user.id,
                activity_id: activity.id,
                day: 1,
                options: {
                    createMany: {
                        data: options as SurvivalDayOption[]
                    }
                }
            }
        })
        const stats = await getGameStats(game.id, user.id)
        t.same(stats.distance_in_meters, 1000)
        t.same(stats.elapsed_time_in_seconds, 3600)
        t.same(stats.days_not_rested, 1)
        t.same(stats.days_rested, 0)
    }).catch(e => {
        console.error(e)
    })

    await t.test('POST /games/start - Create a new game', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await fastify.inject({ method: 'POST', url: '/games/start', headers: { authorization: `Bearer ${token}` }, payload: { difficulty: 'easy' } })
        t.hasProps(game.json(), ['id', 'status', 'difficulty', 'max_duration_in_seconds', 'min_duration_in_seconds', 'daily_food_loss', 'daily_water_loss'])
    }).catch(e => {
        console.error(e)
    })

    await t.test('GET /games/me - Fetch the user\'s current game', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        await fastify.inject({ method: 'POST', url: '/games/start', headers: { authorization: `Bearer ${token}` }, payload: { difficulty: 'easy' } })
        const game = await fastify.inject({ method: 'GET', url: '/games/me', headers: { authorization: `Bearer ${token}` } })
        t.hasProps(game.json(), ['id', 'status', 'difficulty', 'max_duration_in_seconds', 'min_duration_in_seconds', 'daily_food_loss', 'daily_water_loss'])
    }).catch(e => {
        console.error(e)
    })

})


