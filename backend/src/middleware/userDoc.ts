import type { NextFunction, Response } from 'express'
import { User, type IUser } from '../models/User.js'
import type { AuthedRequest } from './auth.js'
import { env } from '../config/env.js'

declare module 'express-serve-static-core' {
  interface Request {
    userDoc?: IUser | null
  }
}

export async function attachUserDoc(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!env.mongoUri) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const doc = await User.findById(req.user.id)
  if (!doc) {
    return res.status(404).json({ error: 'User not found' })
  }

  req.userDoc = doc
  return next()
}


