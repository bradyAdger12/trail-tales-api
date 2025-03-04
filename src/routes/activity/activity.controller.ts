import { Activity, Challenge, Matchup, MatchupEntry, Squad, SquadMember, User } from "@prisma/client"
import { prisma } from "../../db"
import _ from "lodash"
import { getResultsAndSum } from "../../cron/post_matchup"
type UserWithMatchupEntry = { user: User & { matchup_entries: MatchupEntry[] } }
type MemberWithUser = SquadMember & { user: User }
type MatchupWithMembers = Matchup & { challenge: Challenge } & { squad_one: Squad & { members: UserWithMatchupEntry[] }, squad_two: Squad & { members: UserWithMatchupEntry[] } }

export async function processActivityForMatchup(userId: string, activity: Activity, matchup: Matchup & { challenge: Challenge }) {
    try {
        if (matchup.challenge.name === 'fastest_mile') {
            await processFastestSegment(userId, activity, matchup, 1609.4)
        } else if (matchup.challenge.name === 'fastest_5k') {
            await processFastestSegment(userId, activity, matchup, 5000)
        } else if (matchup.challenge.name === 'the_long_haul') {
            await processMaxDistanceSegment(userId, activity, matchup)
        } else if (matchup.challenge.name === 'mileage_madness') {
            await processTotalDistanceSegment(userId, activity, matchup)
        }

        const updatedMatchup = await prisma.matchup.findFirst({
            where: {
                id: matchup.id
            },
            select: {
                squad_two: {
                    select: {
                        members: {
                            select: {
                                user: {
                                    select: {
                                        matchup_entries: true
                                    }
                                }
                            }
                        }
                    }
                },
                squad_one: {
                    select: {
                        members: {
                            select: {
                                user: {
                                    select: {
                                        matchup_entries: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const squadOneScore = getResultsAndSum(updatedMatchup?.squad_one.members as any, matchup.challenge.type)
        const squadTwoScore = getResultsAndSum(updatedMatchup?.squad_two.members as any, matchup.challenge.type)

        if (_.isNumber(squadOneScore) && _.isNumber(squadTwoScore)) {
            await prisma.matchup.update({
                where: {
                    id: matchup.id
                },
                data: {
                    squad_one_score: squadOneScore,
                    squad_two_score: squadTwoScore
                }
            })
        }
    } catch (e) {
        console.error(e)
    }
}

async function processTotalDistanceSegment(userId: string, activity: Activity, matchup: Matchup & { challenge: Challenge }) {
    if (activity.distance_in_meters) {
        try {
            const entry = await prisma.matchupEntry.findFirst({
                where: {
                    matchup_id: matchup.id,
                    user_id: userId
                }
            })
            if (!entry) {
                await prisma.matchupEntry.create({
                    data: {
                        value: activity.distance_in_meters,
                        activity_id: activity.id,
                        matchup_id: matchup.id,
                        user_id: userId,
                    }
                })
            } else {
                await prisma.matchupEntry.update({
                    where: {
                        user_id_matchup_id: {
                            user_id: userId,
                            matchup_id: matchup.id
                        }
                    },
                    data: {
                        value: {
                            increment: activity.distance_in_meters
                        }
                    }
                })
            }
        } catch (e) {
            console.error(e)
            throw new Error(e as string)
        }
    }
}

async function processMaxDistanceSegment(userId: string, activity: Activity, matchup: Matchup & { challenge: Challenge }) {
    if (activity.distance_in_meters) {
        try {
            const entry = await prisma.matchupEntry.findFirst({
                where: {
                    matchup_id: matchup.id,
                    user_id: userId
                }
            })
            if (!entry) {
                await prisma.matchupEntry.create({
                    data: {
                        value: activity.distance_in_meters,
                        activity_id: activity.id,
                        matchup_id: matchup.id,
                        user_id: userId,
                    }
                })
            } else if (activity.distance_in_meters > entry.value) {
                await prisma.matchupEntry.update({
                    where: {
                        user_id_matchup_id: {
                            user_id: userId,
                            matchup_id: matchup.id
                        }
                    },
                    data: {
                        value: activity.distance_in_meters
                    }
                })
            }
        } catch (e) {
            throw new Error(e as string)
        }
    }
}

async function processFastestSegment(userId: string, activity: Activity, matchup: Matchup & { challenge: Challenge }, distance: number) {
    if (activity.distance_series.length === activity.time_series.length) {
        const fastestSegment = findFastestSegment(activity.distance_series, activity.time_series, distance)
        if (!_.isEmpty(fastestSegment) && fastestSegment.time) {
            try {
                const entry: any = await prisma.matchupEntry.findFirst({
                    where: {
                        matchup_id: matchup.id,
                        user_id: userId
                    }
                })
                if (!entry) {
                    await prisma.matchupEntry.create({
                        data: {
                            value: fastestSegment.time,
                            activity_id: activity.id,
                            matchup_id: matchup.id,
                            user_id: userId,
                        }
                    })
                } else if (entry.value && fastestSegment.time < entry.value) {
                    await prisma.matchupEntry.update({
                        where: {
                            user_id_matchup_id: {
                                user_id: userId,
                                matchup_id: matchup.id
                            }
                        },
                        data: {
                            value: fastestSegment.time
                        }
                    })
                }
            } catch (e) {
                console.error(e)
                throw new Error(e as string)
            }
        }
    }
}

function findFastestSegment(distances: number[], timestamps: number[], goal_distance: number) {
    let fastestTime = Infinity;
    let fastestSegment = { startIndex: null, endIndex: null, time: null } as any;

    let start = 0;

    for (let end = 0; end < distances.length; end++) {
        while (distances[end] - distances[start] >= goal_distance) {
            let timeTaken = timestamps[end] - timestamps[start];

            if (timeTaken < fastestTime) {
                fastestTime = timeTaken;
                fastestSegment = { startIndex: start, endIndex: end, time: fastestTime };
            }
            start++;  // Move start forward to check the next possible segment
        }
    }

    return fastestSegment;
}