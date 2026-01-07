import { Router } from 'express'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import { User } from '../models/User.js'

export const adminRouter = Router()

// Middleware to ensure user is admin
const requireAdmin = (req: AuthedRequest, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admins only' })
  }
  next()
}

adminRouter.get('/stats', requireAuth, requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    // 1. Total Users
    const totalUsers = await User.countDocuments()

    // 2. Active Subscriptions
    const activeSubs = await User.countDocuments({ subscriptionStatus: 'active' })

    // 3. Plan Breakdown
    const silverCount = await User.countDocuments({ subscriptionPlan: 'SILVER', subscriptionStatus: 'active' })
    const goldCount = await User.countDocuments({ subscriptionPlan: 'GOLD', subscriptionStatus: 'active' })
    const platinumCount = await User.countDocuments({ subscriptionPlan: 'PLATINUM', subscriptionStatus: 'active' })

    // 4. Monthly Revenue (Estimate based on plan prices)
    // Prices: Silver $29, Gold $49, Platinum $79 (Example values)
    const revenue = (silverCount * 29) + (goldCount * 49) + (platinumCount * 79)

    res.json({
      totalUsers,
      activeSubs,
      revenue,
      plans: {
        silver: silverCount,
        gold: goldCount,
        platinum: platinumCount
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ error: 'Failed to fetch admin stats' })
  }
})

adminRouter.get('/users', requireAuth, requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

adminRouter.put('/users/:id/role', requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (!['user', 'trainer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash')
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error updating user role:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
})
