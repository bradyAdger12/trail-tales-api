import { FastifyPluginAsync } from 'fastify';
import _ from 'lodash'
import { prisma } from '..';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { SAFE_USER_RETURN } from '../lib/safe_return_data';
import { authenticate } from '../middleware/authentication';
import * as crypto from "node:crypto";
import { sendEmail } from '../resend/send_email';

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
                200: {
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
            return reply.status(500).send('Password must be at least 8 characters long')
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
            return reply.status(500).send('User with same email exists')
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
                200: { properties: { token: { type: 'string' }, user: { $ref: 'user_return#' } } }
            }
        }
    }, async (request, reply) => {
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

        var token = jwt.sign({ name: user.display_name, email: user.email, id: user.id }, process.env.JWT_SECRET as string);
        const user_without_password = {
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                created_at: user.created_at,
                updated_at: user.updated_at
            }
        }
        console.log(user)
        return reply.status(200).send({
            token,
            ...user_without_password
        })
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
        const body = request.body
        if (!_.has(body, 'email')) {
            return reply.status(500).send('Email is required')
        }
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
                await sendEmail('password_reset.html', { url: `${process.env.WEB_BASE_URL}/auth/reset-password?token=${hashed_token}` })
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
        const body = request.body
        if (!_.has(body, 'password')) {
            return reply.status(500).send('Password is required')
        }
        if (!_.has(body, 'token')) {
            return reply.status(500).send('Token is required')
        }
        const password = body.password as string
        if (password.length < 8) {
            return reply.status(500).send('Password must be at least 8 characters long')
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