import { User } from "@prisma/client"
import { prisma } from "../../db"

export const handleUserStory = async (user: User, distance_in_meters: number) => {
    const story = await prisma.story.findFirst({
        where: {
            user_id: user.id
        },
        include: {
            chapters: {
                orderBy: {
                    created_at: 'desc'
                }
            }
        }
    })
    console.log(story?.chapters)
  
}
