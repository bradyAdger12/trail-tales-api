import 'dotenv/config'
import _ from 'lodash'
import buildServer, { prisma } from "./server";
import { CronJob } from 'cron';
import axios from 'axios';
import { Challenge, Squad } from '@prisma/client';


// Cron for matching up squads
const job = CronJob.from({
  cronTime: '*/3 * * * *', // cronTime
  onTick: matchupSquads, // onTick
  onComplete: null, // onComplete
  start: true, // start
  timeZone: 'America/Denver', // timeZone
  runOnInit: true
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
            matchup_one: null
          },
          {
            matchup_two: null
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

// Cron for building reports from matchups that have concluded
const postMatchupCron = CronJob.from({
  cronTime: '*/3 * * * *', // cronTime
  onTick: buildPostMatchupReports, // onTick
  onComplete: null, // onComplete
  start: true, // start
  timeZone: 'America/Denver', // timeZone
  runOnInit: true
});

async function buildPostMatchupReports() {
  try {
    const concludedMatchups = await prisma.matchup.findMany({
      where: {
        ends_at: {
          lte: new Date().toISOString()
        }
      },
      include: {
        squad_one: {
          select: {
            id: true,
            name: true,
            description: true,
            members: {
              select: {
                user: {
                  select: {
                    id: true,
                    display_name: true,
                    matchup_entries: {
                      select: {
                        value: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        squad_two: {
          select: {
            id: true,
            name: true,
            description: true,
            members: {
              select: {
                user: {
                  select: {
                    id: true,
                    display_name: true,
                    matchup_entries: {
                      select: {
                        value: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    for (const matchup of concludedMatchups) {
      const uniqueUsers = matchup.squad_one.members.map((item) => { return { user_id: item.user.id, display_name: item.user.display_name, entry: item.user.matchup_entries[0]?.value || -1 } }).concat(matchup.squad_two.members.map((item) => { return { user_id: item.user.id, display_name: item.user.display_name, entry: item.user.matchup_entries[0]?.value || -1 } }))
      await prisma.$transaction([
        prisma.matchupReport.upsert({
          where: {
            matchup_id: matchup.id
          },
          update: {},
          create: {
            matchup_id: matchup.id,
            squad_one_id: matchup.squad_one_id,
            squad_two_id: matchup.squad_two_id,
            challenge_id: matchup.challenge_id,
            squad_one_snapshot: {
              name: matchup.squad_one.name,
              description: matchup.squad_one.description,
              entries: matchup.squad_one.members.map((item) => { return { user_id: item.user.id, display_name: item.user.display_name, entry: item.user.matchup_entries[0]?.value || -1 } })
            },
            squad_two_snapshot: {
              name: matchup.squad_two.name,
              description: matchup.squad_two.description,
              entries: matchup.squad_two.members.map((item) => { return { user_id: item.user.id, display_name: item.user.display_name, entry: item.user.matchup_entries[0]?.value || -1 } })
            }
          }
        }),
        prisma.matchupReportUsers.createMany({
          data: uniqueUsers.map((item) => { return { user_id: item.user_id, matchup_report_id: matchup.id }})
        })
      ]).catch(() => {})
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