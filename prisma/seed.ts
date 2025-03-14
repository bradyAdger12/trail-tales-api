import { PrismaClient, StoryTemplate } from '@prisma/client'
const prisma = new PrismaClient()

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