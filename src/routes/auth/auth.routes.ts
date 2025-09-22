import { FastifyPluginAsync } from 'fastify';
import _ from 'lodash'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as crypto from "node:crypto";
import { sendEmail } from '../../resend/send_email';
import { SCHEMA_USER_RETURN } from '../user/user.schema';
import { prisma } from '../../db';
import { User } from '@prisma/client';
import { signAccessToken, signRefreshToken } from './auth.controller';
import { jwtDecode } from 'jwt-decode';

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
                    timezone: { type: 'string' },
                    display_name: { type: 'string' }
                },
                required: ['email', 'password', 'display_name', 'timezone']
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' }
                    }
                },
                default: { type: "object", properties: { message: { type: "string" } } }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { email: string, password: string, display_name: string, timezone: string }
        const email = body.email
        const password = body.password as string
        const displayName = body.display_name as string
        const timezone = body.timezone as string

        if (password.length < 8) {
            return reply.status(400).send({ message: 'Password must be at least 8 characters long' })
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const user_with_same_email = await prisma.user.findFirst({
            where: {
                email: {
                    equals: email
                }
            }
        })
        if (user_with_same_email) {
            return reply.status(400).send({ message: 'User with same email exists' })
        }
        await prisma.user.create({
            data: {
                email: body.email,
                hashed_password: hash,
                display_name: displayName,
                timezone: timezone
            }
        })
        return reply.status(201).send({ success: true })
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
                200: { properties: { token: { type: 'string' }, refreshToken: { type: 'string' }, user: SCHEMA_USER_RETURN } },
                default: { type: "object", properties: { message: { type: "string" } } }
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

    // Google Auth
    fastify.post('/google/auth', {
        schema: {
            tags: ['auth'],
            body: {
                type: 'object',
                properties: {
                    token: { type: 'string' }
                },
                required: ['token']
            },
            response: {
                200: { properties: { token: { type: 'string' }, refreshToken: { type: 'string' }, user: SCHEMA_USER_RETURN } },
                default: { type: "object", properties: { message: { type: "string" } } }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { token: string }
        const googleToken = body.token as string
        const decoded = jwtDecode(googleToken) as { email: string, name: string, sub: string }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(decoded.sub, salt);
        let user
        if (decoded.sub) {
            user = await prisma.user.findFirst({
                where: {
                    email: decoded.email
                }
            })
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        google_id: decoded.sub,
                        email: decoded.email,
                        hashed_password: hash,
                        display_name: decoded.name
                    }
                })
            }
            const token = signAccessToken(user)
            const refreshToken = signRefreshToken(user)
            return reply.status(200).send({
                token,
                refreshToken,
                user
            })
        }
    })

    fastify.post('/refresh', {
        schema: {
            tags: ['auth'],
            response: {
                200: { properties: { token: { type: 'string' }, refreshToken: { type: 'string' } } },
                default: { type: "object", properties: { message: { type: "string" } } }
            }
        }
    }, async (request, reply) => {
        const authHeader = request.headers['authorization']
        if (!authHeader) {
            return reply.status(403).send({ message: 'You do have not have permissions to access this resource' })
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
                return reply.status(401).send({ message: 'Invalid refresh token' })
            }
        } catch (e) {
            return reply.status(401).send({ message: 'You do have not have permissions to access this resource' })
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
                200: { properties: { success: { type: 'boolean' } } },
                default: { type: "object", properties: { message: { type: "string" } } }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { email: string }
        const email = body.email
        if (!email) {
            return reply.status(400).send({ message: 'Email is required' })
        }
        const token = crypto.randomBytes(64).toString('hex');
        const salt = await bcrypt.genSalt(10)
        const hashed_token = await bcrypt.hash(token, salt)
        const expiry_date = new Date()
        expiry_date.setDate(expiry_date.getDate() + 1) // set 24 hour expiry time for password reset tokens
        const expiry_time = expiry_date

        try {
            let user
            try {
                user = await prisma.user.findFirst({
                    where: {
                        email: {
                            equals: email
                        }
                    }
                })
            } catch (e) { }
            if (user) {
                await prisma.passwordResetToken.create({
                    data: {
                        user_id: user.id,
                        token: hashed_token,
                        expiry_time
                    }
                })
                await sendEmail('password_reset.html', { url: `${request.headers.origin}/reset-password?token=${hashed_token}` }, 'Reset Your Password')
            } else {
                return { success: true }
            }
        } catch (e) {
            return reply.status(500).send({ message: 'Error sending email' })
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
                required: ['token', 'password']
            },
            response: {
                200: { properties: { success: { type: 'boolean' } } },
                default: { type: "object", properties: { message: { type: "string" } } }
            }
        }
    }, async (request, reply) => {
        const body = request.body as { password: string, token: string }
        const password = body.password as string
        try {
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
                return reply.status(404).send({ message: 'Password reset request was not found' })
            }
            if (new Date() > password_reset_token.expiry_time) {
                return reply.status(500).send({ message: 'Token has expired' })
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
        } catch (e) {
            return reply.status(500).send({ message: 'Error resetting password' })
        }
    })

};

export default authRoutes