import { Activity, Challenge, Matchup } from "@prisma/client"
import { prisma } from "../../db"
import _ from "lodash"

export async function processActivityForMatchup(userId: string, activity: Activity, matchup: Matchup & { challenge: Challenge }) {
    if (matchup.challenge.name === 'fastest_mile') {
        processFastestSegment(userId, activity, matchup, 1609.4)
    } else if (matchup.challenge.name === 'fastest_5k') {
        processFastestSegment(userId, activity, matchup, 5000)
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