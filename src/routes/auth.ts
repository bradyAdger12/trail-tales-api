import { FastifyPluginAsync } from 'fastify';
import _ from 'lodash'
import { prisma } from '..';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SAFE_USER_RETURN } from '../helper/safe_return_data';

const authRoutes: FastifyPluginAsync = async (fastify) => {

    // Register
    fastify.post('/register', async (request, reply) => {
        const body = request.body
        if (!_.has(body, 'email')) {
            return reply.status(500).send('Email is required')
        }
        if (!_.has(body, 'password')) {
            return reply.status(500).send('Password is required')
        }
        if (!_.has(body, 'display_name')) {
            return reply.status(500).send('Display name is required')
        }
        const email = body.email
        const password = body.password as string
        const displayName = body.display_name as string
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user_with_same_email = await prisma.user.findFirst({
            select: SAFE_USER_RETURN,
            where: {
                email: {
                    equals: email
                }
            }
        })
        if (user_with_same_email) {
            return reply.status(500).send('User with same email exists')
        }
        const user = await prisma.user.create({
            select: SAFE_USER_RETURN,
            data: {
                email: body.email,
                hashed_password: hash,
                display_name: displayName
            }
        })
        return user
    });

    // Login
    fastify.post('/login', async (request, reply) => {
        const body = request.body
        if (!_.has(body, 'email')) {
            return reply.status(500).send('Email is required')
        }
        if (!_.has(body, 'password')) {
            return reply.status(500).send('Password is required')
        }
        const email = body.email
        const password = body.password as string
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email
                }
            }
        })
        if (!user) {
            return reply.status(500).send('Username or password is incorrect')
        }
        const isCorrectPassword = await bcrypt.compare(password, user.hashed_password)
        if (!isCorrectPassword) {
            return reply.status(500).send('Username or password is incorrect')
        }

        var token = jwt.sign({ name: user.display_name, email: user.email }, process.env.JWT_SECRET as string);
        const user_without_password = {
            user: {
                email: user.email,
                display_name: user.display_name,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
        }
        return reply.status(200).send({
            token,
            ...user_without_password
        })
    });
};

export default authRoutes