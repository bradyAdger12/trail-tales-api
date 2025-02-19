import { FastifyPluginAsync } from 'fastify';
import _ from 'lodash'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SAFE_USER_RETURN } from '../../lib/safe_return_data';
import * as crypto from "node:crypto";
import { sendEmail } from '../../resend/send_email';
import { SCHEMA_USER_RETURN } from '../user/user.schema';
import { prisma } from '../../db';
import { User } from '@prisma/client';
import { signAccessToken, signRefreshToken } from './auth.controller';

const authRoutes: FastifyPluginAsync = async (fastify) => {

    // Register
    fastify.post('/register', {
        schema: {
            tags: ['auth'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                    display_name: { type: 'string' }
                },
                required: ['email', 'password', 'display_name']
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { email: string, password: string, display_name: string }
        const email = body.email
        const password = body.password as string
        const displayName = body.display_name as string

        if (password.length < 8) {
            return reply.status(400).send({ message: 'Password must be at least 8 characters long' })
        }
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
            return reply.status(500).send({ message: 'User with same email exists' })
        }
        await prisma.user.create({
            select: SAFE_USER_RETURN,
            data: {
                email: body.email,
                hashed_password: hash,
                display_name: displayName
            }
        })
        return { success: true }
    });

    // Login
    fastify.post('/login', {
        schema: {
            tags: ['auth'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                },
                required: ['email', 'password']
            },
            response: {
                200: { properties: { token: { type: 'string' }, refreshToken: { type: 'string' }, user: SCHEMA_USER_RETURN } }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { email: string, password: string }
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
            return reply.status(401).send({ message: 'Username or password is incorrect' })
        }
        const isCorrectPassword = await bcrypt.compare(password, user.hashed_password)
        if (!isCorrectPassword) {
            return reply.status(401).send({ message: 'Username or password is incorrect' })
        }

        var token = signAccessToken(user)
        var refreshToken = signRefreshToken(user)
        return reply.status(200).send({
            token,
            refreshToken,
            user
        })
    });

    fastify.post('/refresh', {
        schema: {
            tags: ['auth'],
            response: {
                200: { properties: { token: { type: 'string' }, refreshToken: { type: 'string' } } }
            }
        }
    }, async (request, reply) => {
        const authHeader = request.headers['authorization']
        if (!authHeader) {
            return reply.status(403).send('You do have not have permissions to access this resource')
        }
        try {
            const token: string = authHeader?.split(' ')[1]!
            const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string)
            if (decodedToken) {
                const user = decodedToken as User
                const token = signAccessToken(user)
                const refreshToken = signRefreshToken(user)
                return { token, refreshToken }
            } else {
                return reply.status(401).send('Invalid refresh token')
            }
        } catch (e) {
            return reply.status(401).send('You do have not have permissions to access this resource')
        }
    });

    // Password Reset Email
    fastify.post('/send_password_reset', {
        schema: {
            tags: ['auth'],
            body: {
                type: 'object',
                properties: {
                    email: { type: 'string' }
                },
                required: ['email']
            },
            response: {
                200: { properties: { success: { type: 'boolean' } } }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { email: string }
        const email = body.email
        const token = crypto.randomBytes(64).toString('hex');
        const salt = await bcrypt.genSalt(10)
        const hashed_token = await bcrypt.hash(token, salt)
        const expiry_date = new Date()
        expiry_date.setDate(expiry_date.getDate() + 1) // set 24 hour expiry time for password reset tokens
        const expiry_time = expiry_date
        const user = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email
                }
            }
        })
        if (user) {
            try {
                await prisma.passwordResetToken.create({
                    data: {
                        user_id: user.id,
                        token: hashed_token,
                        expiry_time
                    }
                })
                await sendEmail('password_reset.html', { url: `${process.env.WEB_BASE_URL}/auth/reset-password?token=${hashed_token}` }, 'Reset Your Password')
            } catch (e) {
                return reply.status(500).send('Error sending email')
            }
        }
        return { success: true }
    })

    // Reset Password
    fastify.put('/reset_password', {
        schema: {
            tags: ['user'],
            body: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    password: { type: 'string' }
                },
                required: ['email', 'password']
            },
            response: {
                200: { properties: { success: { type: 'boolean' } } }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { password: string, token: string }
        const password = body.password as string
        if (password.length < 8) {
            return reply.status(400).send({ message: 'Password must be at least 8 characters long' })
        }
        const token = body.token as string
        const password_reset_token = await prisma.passwordResetToken.findFirst({
            where: {
                token: {
                    equals: token
                }
            }
        })
        if (!password_reset_token) {
            return reply.status(404).send('Password reset request was not found')
        }
        if (new Date() > password_reset_token.expiry_time) {
            return reply.status(500).send('Token has expired')
        }

        const salt = await bcrypt.genSalt(10)
        const hashed_password = await bcrypt.hash(password, salt)
        const updated_user = await prisma.user.update({
            data: {
                hashed_password
            },
            where: {
                id: password_reset_token.user_id
            }
        })
        return { success: true }
    })

};

export default authRoutes