import { Router } from 'express'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { env } from '../config/env.js'

export const meRouter = Router()

meRouter.get('/', requireAuth, async (req: AuthedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!env.mongoUri) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const user = await User.findById(req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  return res.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    subscriptionPlan: user.subscriptionPlan
  })
})


