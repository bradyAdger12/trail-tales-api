import { faker } from "@faker-js/faker"
import bcrypt from 'bcrypt'
import { randomUUID } from "crypto"
import { processActivityForMatchup } from "../routes/activity/activity.routes"
import { prisma } from "../db"

const squadIds = ['ad31076a-4993-490b-bf23-e006b66041a2', '1f4b1ac6-d64b-4ad6-8ad2-e4d2b272b2d0']

async function execute() {
    const users: any = []
    await prisma.user.deleteMany({
        where: {
            display_name: {
                contains: '_test'
            }
        }
    })
    for (let i = 0; i < 28; i++) {
        const id = randomUUID()
        const email = faker.internet.email()
        const display_name = faker.internet.displayName() + '_test'
        const password = 'foobar123'
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        users.push({ id, email, display_name, hashed_password: hash })
    }

    for (const user of users) {
        const { distance, time } = buildMockActivity(893)
        const index = Math.floor(Math.random() * squadIds.length)

        // Create user. add to a squad. create an activity
        const [userReturn, squadMemberReturn, activityReturn] = await prisma.$transaction([
            prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email,
                    display_name: user.display_name,
                    hashed_password: user.hashed_password
                }
            }),
            prisma.squadMember.create({
                data: {
                    user_id: user.id,
                    squad_id: squadIds[index]
                }
            }),
            prisma.activity.create({
                data: {
                    user_id: user.id,
                    name: faker.word.words({ count: 3 }),
                    description: faker.word.words({ count: 3 }),
                    distance_series: distance,
                    time_series: time,
                    distance_in_meters: distance[distance.length - 1] - distance[0],
                    elapsed_time_in_seconds: time[time.length - 1] - time[0],
                    polyline: 'adsasdfasdf',
                    source: 'strava',
                    source_id: randomUUID()
                }
            })
        ])

        // fetch active matchup

        const currentMatchup = await prisma.matchup.findFirst({
            include: {
                challenge: true
            },
            where: {
                ends_at: {
                    gte: new Date().toISOString()
                },
                starts_at: {
                    lte: new Date().toISOString()
                },
                OR: [
                    {
                        squad_one: {
                            members: {
                                some: {
                                    user_id: user.id
                                }
                            }
                        }
                    },
                    {
                        squad_two: {
                            members: {
                                some: {
                                    user_id: user.id
                                }
                            }
                        }
                    }
                ]
            }
        })

        if (currentMatchup) {
            await processActivityForMatchup(user.id, activityReturn, currentMatchup)
        }
    }
}

function buildMockActivity(size: number) {
    const distance = [200]
    const time = [60]
    let currentTime = time[0]
    let currentDistance = distance[0]
    for (let i = 0; i < size; i++) {
        const distanceFoward = Math.random() * 5
        const timeForward = Math.random() * 1.62
        currentDistance = currentDistance + distanceFoward
        currentTime = currentTime + timeForward
        distance.push(currentDistance)
        time.push(currentTime)
    }

    return { time, distance }
}

execute()