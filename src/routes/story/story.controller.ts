import { Difficulty } from "@prisma/client";
import { z } from "genkit";
export const ItemSchema = z.object({
    name: z.string().describe('the name of the item'),
    description: z.string().describe('the description of the item'),
    benefit: z.enum(['health', 'distance']).describe('the benefit of the item'),
    value: z.number().describe('the value of the benefit'),
})
const UserActionSchema = z.object({
    action: z.string().describe('a short description for the user action '),
    difficulty: z.enum(['easy', 'medium', 'hard']).describe('the difficulty of the action being performed')
})
export const ChapterOutputSchema = z.object({
    title: z.string().describe('chapter title'),
    description: z.string().describe('chapter description'),
    actions: z.array(UserActionSchema).describe('list of user actions'),
    items: z.array(ItemSchema).describe('list of items that can be found along the way')
}).describe('chapter')

export function getHealthDecrement(difficulty: Difficulty) {
    switch (difficulty) {
        case 'easy':
            return -10
        case 'medium':
            return -7
        case 'hard':
            return -4
    }
}