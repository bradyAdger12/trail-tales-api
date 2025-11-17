import { test } from 'tap'
import buildServer from '../../../server'
import { registerAndLoginUser } from '../../../test/setup'
import { startGame } from '../../game/game.controller'
import { generateNextDayOptions } from '../survival_day.controller'
import { FastifyInstance } from 'fastify'
import { SurvivalDay, SurvivalDayOption, User } from '@prisma/client'
import { prisma } from '../../../db'
import _ from 'lodash'

let fastify: FastifyInstance
let users: User[] = []
test('survival days', async (t) => {

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
        await prisma.$disconnect()
        await fastify.close()
    })

    await t.test('options are generated correctly', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        const options = await generateNextDayOptions(game)
        t.same(options.length, 4)
        const difficulties = options.map(option => option.difficulty)
        t.same(difficulties.sort(), ['easy', 'hard', 'medium', 'rest'])
    }).catch(e => {
        console.error(e)
    })

    await t.test('option durations are correctly in order', async (t) => {
        const { token, user } = await registerAndLoginUser(fastify)
        users.push(user)
        const game = await startGame(user.id, 'easy')
        const survivalDay = game.survival_days[0] as SurvivalDay & { options: SurvivalDayOption[] }
        const options = survivalDay.options
        t.same(_.sortBy(options, 'duration_in_seconds').map(option => option.difficulty), ['rest', 'easy', 'medium', 'hard'])
    }).catch(e => {
        console.error(e)
    })
})