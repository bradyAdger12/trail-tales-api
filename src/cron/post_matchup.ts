import { CronJob } from "cron"
import _ from "lodash"
import { MatchupEntry, Squad, SquadMember, User } from "@prisma/client"
import { prisma } from "../db"

type SquadWithMatchupEntries = Squad & { members: (SquadMember & { user: User & { matchup_entries: MatchupEntry[] } })[] }

function calculateWinningSquadByTime(squadOne: SquadWithMatchupEntries, squadTwo: SquadWithMatchupEntries) {
    const squadOneTotalTime = getTimesAndSum(squadOne.members)
    const squadTwoTotalTime = getTimesAndSum(squadOne.members)
    return squadOneTotalTime < squadTwoTotalTime ? [squadOne, squadTwo] : [squadTwo, squadOne]
}

export function getTimesAndSum(members: (SquadMember & { user: User & { matchup_entries: MatchupEntry[] } })[]) {
    let squadTotalTime = 0
    // Sort entries by value and take the top 5 values
    const squadSortedMembersByTime = _.sortBy(members, (item) => item.user.matchup_entries[0]?.value)
    console.log(squadSortedMembersByTime)
    squadTotalTime += _.reduce(squadSortedMembersByTime, (a, b) => { return a + b.user.matchup_entries[0]?.value || 0 }, 0)

    return Math.round(squadTotalTime / squadSortedMembersByTime.length)
}

function determineWinningAndLosingSquad(squadOne: any, squadTwo: any, challengeType: string) {
    if (challengeType === 'time') {
        return calculateWinningSquadByTime(squadOne, squadTwo)
    }
    return []
}

// Cron for building reports from matchups that have concluded
export const postMatchupCron = CronJob.from({
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
                challenge: {
                    select: {
                        type: true
                    }
                },
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
            const [winningSquad, losingSquad] = determineWinningAndLosingSquad(matchup.squad_one, matchup.squad_two, matchup.challenge.type)
            await prisma.$transaction([
                prisma.squad.update({
                    where: {
                        id: winningSquad?.id
                    },
                    data: {
                        wins: {
                            increment: 1
                        },
                        xp: {
                            increment: 50
                        }
                    }
                }),
                prisma.squad.update({
                    where: {
                        id: losingSquad?.id
                    },
                    data: {
                        losses: {
                            increment: 1
                        }
                    }
                }),
                prisma.matchupReport.create({
                    data: {
                        matchup_id: matchup.id,
                        snapshot: { ...matchup }
                    }
                }),
                prisma.matchup.delete({
                    where: {
                        id: matchup.id
                    }
                })
            ]).catch((e) => {
                console.log(e)
            })
        }
    } catch (e) {
        console.error(e)
    }
}