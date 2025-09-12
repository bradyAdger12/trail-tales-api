import 'dotenv/config'
import _ from 'lodash'
import buildServer from "./server";
// Cron job to run every hour and check for users at midnight
import cron from 'node-cron'
import { prisma } from './db'
import { advanceSurvivalDay } from './routes/survival_day/survival_day.controller';

const task = cron.schedule('0 * * * *', async () => {
  try {
    console.log('~~ Running cron job')
    const games = await prisma.game.findMany({
      where: {
        status: 'active'
      },
      include: {
        user: {
          include: {
            character: true
          }
        }
      }
    })
    for (const game of games) {
      const userTimezone = game.user.timezone
      const now = new Date()
      const localTime = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }))
      const hour = localTime.getHours()
      if (hour) {
        await advanceSurvivalDay(game)
      }
    }
  } catch (error) {
    console.error('Error in hourly cron job:', error)
  }
})



// Start Fastify server
const main = async () => {
  try {
    const server = await buildServer()
    const port = (process.env.PORT || 3000) as number
    await server.listen({ port, host: '0.0.0.0' });
    task.start()
    // task.stop()
    console.log(`Server listening on port ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1);
  }
};

main()