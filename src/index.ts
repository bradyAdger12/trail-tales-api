import 'dotenv/config'
import _ from 'lodash'
import { CronJob } from 'cron';
import { Challenge, Squad } from '@prisma/client';
import buildServer from "./server";
import { postMatchupCron } from './cron/post_matchup';
import { prisma } from './db';

// Cron for matching up squads
const job = CronJob.from({
  cronTime: '*/3 * * * *', // cronTime
  onTick: matchupSquads, // onTick
  onComplete: null, // onComplete
  runOnInit: true,
  timeZone: 'America/Denver', // timeZone
});

const getShuffledArr = (arr: any[]) => {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr
};

async function matchupSquads() {
  try {
    const challenges = await prisma.challenge.findMany()
    const squadsWithoutMatchups: Squad[] = await prisma.squad.findMany({
      where: {
        AND: [
          {
            matchup_squad_one: null
          },
          {
            matchup_squad_two: null
          }
        ]
      }
    })
    const shuffledSquads = getShuffledArr(squadsWithoutMatchups) as Squad[]
    while (shuffledSquads.length >= 2) {
      const shuffledChallenges = getShuffledArr(challenges) as Challenge[]
      const squad1 = shuffledSquads.pop()
      const squad2 = shuffledSquads.pop()
      if (!squad1 || !squad2) {
        return
      }

      const now = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(now.getDate() + 14)
      await prisma.matchup.create({
        data: {
          challenge_id: shuffledChallenges[0].id,
          squad_one_id: squad1.id,
          squad_two_id: squad2.id,
          ends_at: twoWeeksLater
        }
      })
    }
  } catch (e) {
    console.error(e)
  }
}

const server = buildServer()
// Start Fastify server
const main = async () => {
  try {
    const port = (process.env.PORT || 3000) as number
    await server.listen({ port });
    job.start()
    postMatchupCron.start()
    console.log(`Server listening on port ${port}`)
  } catch (err) {
    console.error(err)
    process.exit(1);
  }
};

main()