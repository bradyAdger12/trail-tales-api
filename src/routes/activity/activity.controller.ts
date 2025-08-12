import { User } from "@prisma/client"
import { Activity } from "@prisma/client"
import { prisma } from "../../db"

export async function processDay(user: User, activity: Activity) {
    const day = new Date(activity.source_created_at).toISOString().split('T')[0]
    const survivalDay = await prisma.survivalDay.findFirst({
        where: {
            created_at: {
                gte: new Date(day),
                lte: new Date(day)
            }
        }
    })
    console.log(survivalDay)
}