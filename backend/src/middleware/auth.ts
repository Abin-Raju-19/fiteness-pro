import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../services/jwt.js'
import type { UserRole } from '../models/User.js'

export interface AuthedRequest extends Request {
  user?: {
    id: string
    role: UserRole
    subscriptionPlan: string | null
  }
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    console.debug(`requireAuth: missing or invalid Authorization header; value=${String(header)}`)
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = header.slice('Bearer '.length)
  try {
    const payload = verifyAccessToken(token)
    req.user = {
      id: payload.sub,
      role: payload.role,
      subscriptionPlan: payload.subscriptionPlan
    }
    return next()
  } catch {
    console.debug('requireAuth: token verification failed')
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(role: UserRole) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    return next()
  }
}


