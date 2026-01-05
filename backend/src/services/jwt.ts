import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { UserRole, SubscriptionPlan } from '../models/User.js'

export interface JwtPayload {
  sub: string
  role: UserRole
  subscriptionPlan: SubscriptionPlan
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret as jwt.Secret, {
    expiresIn: env.jwtAccessTtl as jwt.SignOptions['expiresIn']
  })
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtAccessSecret as jwt.Secret) as JwtPayload
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret as jwt.Secret, {
    expiresIn: env.jwtRefreshTtl as jwt.SignOptions['expiresIn']
  })
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret as jwt.Secret) as JwtPayload
}