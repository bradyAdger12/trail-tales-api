import { test } from 'tap'
import buildServer from '../../../server'
import { registerAndLoginUser } from '../../../test/setup'
import { getGameStats, startGame } from '../game.controller'
import { prisma } from '../../../db'
import { generateNextDayOptions } from '../../survival_day/survival_day.controller'
import { SurvivalDayOption, User } from '@prisma/client'
import { FastifyInstance } from 'fastify'

let fastify: FastifyInstance
let users: User[] = []
test('games', async (t) => {

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
    })

    await t.test('start game', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        t.hasProps(game, ['id', 'status', 'difficulty', 'max_duration_in_seconds', 'min_duration_in_seconds', 'daily_food_loss', 'daily_water_loss'])
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
                source: 'test',
                source_id: 'test',
                polyline: 'test',
                name: 'test',
            }
        })
        const survivalDay = await prisma.survivalDay.create({
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
    })

    await t.test('POST /games/start - Create a new game', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await fastify.inject({ method: 'POST', url: '/games/start', headers: { authorization: `Bearer ${token}` }, payload: { difficulty: 'easy' } })
        t.hasProps(game.json(), ['id', 'status', 'difficulty', 'max_duration_in_seconds', 'min_duration_in_seconds', 'daily_food_loss', 'daily_water_loss'])
    })

    await t.test('GET /games/me - Fetch the user\'s current game', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        await fastify.inject({ method: 'POST', url: '/games/start', headers: { authorization: `Bearer ${token}` }, payload: { difficulty: 'easy' } })
        const game = await fastify.inject({ method: 'GET', url: '/games/me', headers: { authorization: `Bearer ${token}` } })
        t.hasProps(game.json(), ['id', 'status', 'difficulty', 'max_duration_in_seconds', 'min_duration_in_seconds', 'daily_food_loss', 'daily_water_loss'])
    })

})


