import { CronJob } from "cron"
import _ from "lodash"
import { MatchupEntry, Squad, SquadMember, User } from "@prisma/client"
import { prisma } from "../db"

type SquadWithMatchupEntries = Squad & { members: (SquadMember & { user: User & { matchup_entries: MatchupEntry[] } })[] }

function calculateWinningSquadByTime(squadOne: SquadWithMatchupEntries, squadTwo: SquadWithMatchupEntries): { winner?: Squad, loser?: Squad, isTie: boolean } {
    const squadOneTotalTime = getTimesAndSum(squadOne.members)
    const squadTwoTotalTime = getTimesAndSum(squadOne.members)
    if (squadOneTotalTime === squadTwoTotalTime) {
        return { isTie: true, winner: squadOne, loser: squadTwo }
    }
    return squadOneTotalTime < squadTwoTotalTime ? { winner: squadOne, loser: squadTwo, isTie: false } : { winner: squadTwo, loser: squadOne, isTie: false }
}

export function getTimesAndSum(members: (SquadMember & { user: User & { matchup_entries: MatchupEntry[] } })[]) { 
    const squadSortedMembersByTime = _.sortBy(members, (item) => item.user.matchup_entries[0]?.value).filter((item) => item.user.matchup_entries[0]?.value)
    const squadTotalTime = _.reduce(squadSortedMembersByTime, (a, b) => { return a + b.user.matchup_entries[0].value }, 0)
    return Math.round(squadTotalTime / (squadSortedMembersByTime.length || 1))
}

function determineWinningAndLosingSquad(squadOne: any, squadTwo: any, challengeType: string): { winner?: Squad, loser?: Squad, isTie: boolean } {
    if (challengeType === 'time') {
        return calculateWinningSquadByTime(squadOne, squadTwo)
    }
    return { isTie: false }
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
                completed: false,
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
            const { winner, loser, isTie } = determineWinningAndLosingSquad(matchup.squad_one, matchup.squad_two, matchup.challenge.type)
            await prisma.$transaction([
                prisma.squad.update({
                    where: {
                        id: winner?.id
                    },
                    data: {
                        is_engaged: false,
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
                        id: loser?.id
                    },
                    data: {
                        is_engaged: false,
                        losses: {
                            increment: 1
                        }
                    }
                }),
                prisma.matchup.update({
                    where: {
                        id: matchup.id
                    },
                    data: {
                        completed: true
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