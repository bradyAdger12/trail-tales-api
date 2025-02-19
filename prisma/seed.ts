import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    await prisma.challenge.upsert({
        where: { id: 'bcc539f0-03d1-4b1b-abf1-c682c111a5f5' },
        update: {
            label: 'Fastest Mile',
            description: 'One mile. All out. No excuses. Push your limits, chase that PR, and see who’s got the fastest legs. Think you’re quick? Prove it. 🚀🔥'
        },
        create: {
            name: 'fastest_mile',
            label: 'Fastest Mile',
            type: 'time',
            description: 'One mile. All out. No excuses. Push your limits, chase that PR, and see who’s got the fastest legs. Think you’re quick? Prove it. 🚀🔥'
        }
    })
    await prisma.challenge.upsert({
        where: { id: '133b9349-c038-4d16-a0ee-f7e44e9b6f6e' },
        update: {
            label: 'Fastest 5K',
            description: 'Fast or steady, this 5K is all about grit and good vibes. Push the pace, chase a PR, or just cruise with your squad—whatever your style, 5K glory awaits. Lace up and let’s run! 🚀🏁'
        },
        create: {
            name: 'fastest_5k',
            label: 'Fastest 5K',
            type: 'time',
            description: 'Fast or steady, this 5K is all about grit and good vibes. Push the pace, chase a PR, or just cruise with your squad—whatever your style, 5K glory awaits. Lace up and let’s run! 🚀🏁'
        }
    })
    await prisma.challenge.upsert({
        where: { id: '546dd278-847b-4a2f-8c64-cdc047fdfac4' },
        update: {
            label: 'The Long Haul',
            description: 'It’s not about speed, it’s about endurance. Rack up the miles, outlast the competition, and see who can go the distance. Every step counts. Every mile matters. How far can you go? 🚀👣'
        },
        create: {
            name: 'the_long_haul',
            label: 'The Long Haul',
            type: 'distance',
            description: 'It’s not about speed, it’s about endurance. Rack up the miles, outlast the competition, and see who can go the distance. Every step counts. Every mile matters. How far can you go? 🚀👣'
        }
    })
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