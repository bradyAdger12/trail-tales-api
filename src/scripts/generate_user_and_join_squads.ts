import { faker } from "@faker-js/faker"
import { prisma } from "../server"
import { User } from "@prisma/client"
import bcrypt from 'bcrypt'

async function execute() {
    const users: any = []
    for (let i = 0; i < 28; i++) {
        const email = faker.internet.email()
        const display_name = faker.internet.displayName() + '_test'
        const password = 'foobar123'
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        users.push({ email, display_name, hashed_password: hash })
    }
    await prisma.user.createMany({
        data: users
    })
}

execute()