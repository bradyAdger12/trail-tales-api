import { Difficulty } from "@prisma/client";
import { prisma } from "../../db";

export async function startGame(userId: string, difficulty: string) {
    let days = 7
    if (difficulty === 'hard') {
        days = 30
    } else if (difficulty === 'medium') {
        days = 15
    }
    const game = await prisma.game.create({
        data: {
            user_id: userId,
            days: days,
            difficulty: difficulty as Difficulty
        }
    })
    return game
}
