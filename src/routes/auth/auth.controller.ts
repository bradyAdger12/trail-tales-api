import { User } from "@prisma/client";
import jwt from 'jsonwebtoken'
export function signAccessToken (user: User) {
    return jwt.sign({ name: user.display_name, email: user.email, id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '30s' });
}

export function signRefreshToken (user: User) {
    return jwt.sign({ name: user.display_name, email: user.email, id: user.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '30d' });
}