import { CronJob } from "cron"
import _ from "lodash"
import { Level, MatchupEntry, Squad, SquadMember, User } from "@prisma/client"
import { prisma } from "../db"

type SquadWithMatchupEntries = Squad & { members: (SquadMember & { user: User & { matchup_entries: MatchupEntry[] } })[] }

function getSquadLevel(xp: number): Level {
    let level: Level = 'D'
    if (xp > 150) {
        level = 'C'
    }
    if (xp > 300) {
       level = 'B'
    }
    if (xp > 500) {
        level = 'A'
    }
    return level
}

function calculateWinningSquadByTime(squadOne: SquadWithMatchupEntries, squadTwo: SquadWithMatchupEntries, challengeType: string): { winner?: Squad, loser?: Squad, isTie: boolean } {
    const squadOneTotalTime = getResultsAndSum(squadOne.members, challengeType)
    const squadTwoTotalTime = getResultsAndSum(squadOne.members, challengeType)
    if (squadOneTotalTime === squadTwoTotalTime) {
        return { isTie: true, winner: squadOne, loser: squadTwo }
    }
    return squadOneTotalTime < squadTwoTotalTime ? { winner: squadOne, loser: squadTwo, isTie: false } : { winner: squadTwo, loser: squadOne, isTie: false }
}

function calculateWinningSquadByDistance(squadOne: SquadWithMatchupEntries, squadTwo: SquadWithMatchupEntries, challengeType: string): { winner?: Squad, loser?: Squad, isTie: boolean } {
    const squadOneTotalDistance = getResultsAndSum(squadOne.members, challengeType)
    const squadTwoTotalDistance = getResultsAndSum(squadOne.members, challengeType)
    if (squadOneTotalDistance === squadTwoTotalDistance) {
        return { isTie: true, winner: squadOne, loser: squadTwo }
    }
    return squadOneTotalDistance < squadTwoTotalDistance ? { winner: squadOne, loser: squadTwo, isTie: false } : { winner: squadTwo, loser: squadOne, isTie: false }
}

export function getResultsAndSum(members: (SquadMember & { user: User & { matchup_entries: MatchupEntry[] } })[], challengeType: string) {
    const squadSortedMembersByResult = members.filter((item) => item.user.matchup_entries[0]?.value)
    const squadTotal = _.reduce(squadSortedMembersByResult, (a, b) => { return a + b.user.matchup_entries[0].value }, 0)
    return Math.round(squadTotal)
}

function determineWinningAndLosingSquad(squadOne: any, squadTwo: any, challengeType: string): { winner?: Squad, loser?: Squad, isTie: boolean } {
    if (challengeType === 'time') {
        return calculateWinningSquadByTime(squadOne, squadTwo, challengeType)
    } else if (challengeType === 'distance') {
        return calculateWinningSquadByDistance(squadOne, squadTwo, challengeType)
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
                        wins: true,
                        losses: true,
                        xp: true,
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
                        wins: true,
                        losses: true,
                        xp: true,
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
            if (winner) {
                winner.xp += 50
                winner.wins += 1
            }
            if (loser) {
                loser.losses += 1
            }
            if (!isTie && winner) {
                winner.level = getSquadLevel(winner.xp)
            }
            await prisma.$transaction([
                prisma.squad.update({
                    where: {
                        id: winner?.id
                    },
                    data: {
                        is_engaged: false,
                        wins: winner?.wins,
                        level: winner?.level,
                        xp: winner?.xp
                    }
                }),
                prisma.squad.update({
                    where: {
                        id: loser?.id
                    },
                    data: {
                        is_engaged: false,
                        losses: loser?.losses
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