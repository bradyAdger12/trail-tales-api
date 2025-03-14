import axios from "axios"
import { prisma } from "../../db"

export const fetchStravaActivity = async (stravaActivityId: string, access_token: string | null) => {
    if (!access_token) {
        throw new Error('access token not found')
    }
    const response = await axios.get(`https://www.strava.com/api/v3/activities/${stravaActivityId}`, {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    })
    return response.data
}
export const refreshStravaToken = async (userId: string | undefined) => {
    const user = await prisma.user.findFirst({
        where: {
            id: userId
        }
    })
    if (!user) {
        throw new Error('user not found')
    } else if (!user.strava_refresh_token) {
        throw new Error('strava account not authenticated')
    }
    const response = await axios.post(`https://www.strava.com/oauth/token?client_id=${process.env.STRAVA_CLIENT_ID}&client_secret=${process.env.STRAVA_CLIENT_SECRET}&refresh_token=${user.strava_refresh_token}&grant_type=refresh_token`)
    if (response.data) {
        await prisma.user.update({
            where: { id: user.id },
            data: { strava_access_token: response.data.access_token, strava_refresh_token: response.data.refresh_token }
        })
    }
    return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token
    }
}