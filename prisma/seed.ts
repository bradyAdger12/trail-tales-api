import { Character, PrismaClient, StoryTemplate } from '@prisma/client'
import { randomUUID } from 'crypto'
const prisma = new PrismaClient()
const characters = [
    {
        id: '00addf1a-884e-4f1c-893a-f0d6ff060667',
        name: 'The Strava Addict',
        description: 'If it’s not on Strava, did it even happen? Sprints the last 50 meters for an impressive pace, runs circles in the parking lot to hit an even mile, and will 100% die chasing a segment crown.',
        health: 70,
        hunger: 60,
        thirst: 40
    },
    {
        id: '9afb2b98-f1be-4352-9836-d62efad47970',
        name: 'The Gear Junkie',
        description: 'More shoes than miles. Will drop $300 on the latest super shoes but refuses to pay race entry fees. Loves talking about gear, hates talking about actual training.',
        health: 80,
        hunger: 50,
        thirst: 70
    },
    {
        id: '69e6fb91-9d7e-4c1f-87a2-947491b15bc3',
        name: 'The Weekend Warrior',
        description: 'Runs hard, brunches harder. Shows up once a week, goes full send, then spends the next six days "recovering" with pancakes and excuses.',
        health: 65,
        hunger: 90,
        thirst: 50
    }
] as Character[]

const stories =
    [
        {
            id: 'f49445c7-d8de-4496-81e3-b3d98c135db9',
            title: "Escape from the Neon Grid",
            difficulty: 'easy',
            cover_image_url: 'https://trail-tales-ba-9043.s3.us-west-2.amazonaws.com/story_covers/escape_from_neon_grid.webp',
            description: "You wake up in a futuristic city, your mind a blur. A voice crackles in your earpiece: 'They found you. Run.' You’re being hunted by a ruthless AI syndicate that has marked you as an anomaly in their system. Your only chance of survival? Reach a rogue hacker known as Cipher, who can erase your digital footprint—before the drones catch you.",
        }
    ] as StoryTemplate[]
async function main() {
    for (const character of characters) {
        await prisma.character.upsert({
            where: {
                id: character.id
            },
            create: { ...character },
            update: { ...character }
        })
    }
    for (const story of stories) {
        await prisma.storyTemplate.upsert({
            where: {
                id: story.id
            },
            create: { ...story },
            update: { ...story }
        })
    }

    // await prisma.challenge.upsert({
    //     where: { id: '133b9349-c038-4d16-a0ee-f7e44e9b6f6e' },
    //     update: {
    //         label: 'Fastest 5K',
    //         description: 'Fast or steady, this 5K is all about grit and good vibes. Push the pace, chase a PR, or just cruise with your squad—whatever your style, 5K glory awaits. Lace up and let’s run! 🚀🏁'
    //     },
    //     create: {
    //         id: '133b9349-c038-4d16-a0ee-f7e44e9b6f6e',
    //         name: 'fastest_5k',
    //         label: 'Fastest 5K',
    //         type: 'time',
    //         description: 'Fast or steady, this 5K is all about grit and good vibes. Push the pace, chase a PR, or just cruise with your squad—whatever your style, 5K glory awaits. Lace up and let’s run! 🚀🏁'
    //     }
    // })
    // await prisma.challenge.upsert({
    //     where: { id: '546dd278-847b-4a2f-8c64-cdc047fdfac4' },
    //     update: {
    //         label: 'The Long Haul',
    //         description: 'How far can you go for a single run? 🚀👣'
    //     },
    //     create: {
    //         id: '546dd278-847b-4a2f-8c64-cdc047fdfac4',
    //         name: 'the_long_haul',
    //         label: 'The Long Haul',
    //         type: 'distance',
    //         description: 'How far can you go for a single run? 🚀👣'
    //     }
    // })

    // await prisma.challenge.upsert({
    //     where: { id: '1f58ac38-8209-4ba6-b693-bae8637da6e9' },
    //     update: {
    //         label: 'Mileage Madness',
    //         description: 'Rack up as many miles as you can during the given time period.'
    //     },
    //     create: {
    //         id: '1f58ac38-8209-4ba6-b693-bae8637da6e9',
    //         name: 'mileage_madness',
    //         label: 'Mileage Madness',
    //         type: 'distance',
    //         description: 'Rack up as many miles as you can during the given time period.'
    //     }
    // })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })