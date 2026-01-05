import { Router } from 'express'
import { requireAuth, type AuthedRequest } from '../middleware/auth.js'
import type { IUser } from '../models/User.js'
import { attachUserDoc } from '../middleware/userDoc.js'
import { env } from '../config/env.js'

export const userRouter = Router()

userRouter.get(
  '/profile',
  requireAuth,
  attachUserDoc,
  (req: AuthedRequest, res) => {
    if (!req.userDoc) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({
      id: req.userDoc._id,
      email: req.userDoc.email,
      role: req.userDoc.role,
      name: req.userDoc.name,
      subscriptionPlan: req.userDoc.subscriptionPlan,
      workoutCartCount: req.userDoc.workoutCart.length
    })
  }
)

userRouter.get('/progress', requireAuth, (_req: AuthedRequest, res) => {
  // Demo data for charts: last 7 days of weight/BMI.
  const today = new Date()
  const points = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - idx))
    return {
      date: d.toISOString().slice(0, 10),
      weight: 70 + idx * 0.3, // kg
      bmi: 23 + idx * 0.1
    }
  })

  res.json({ points })
})

userRouter.get('/achievements', requireAuth, (_req: AuthedRequest, res) => {
  const now = new Date()
  const achievements = [
    {
      id: 'a1',
      title: '7-day streak',
      description: 'Completed workouts 7 days in a row.',
      earnedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'streak',
      points: 50
    },
    {
      id: 'a2',
      title: 'First AI workout',
      description: 'Finished your first AI-generated workout plan.',
      earnedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'milestone',
      points: 20
    },
    {
      id: 'a3',
      title: '3,000 calories this week',
      description: 'Burned over 3,000 calories in the last 7 days.',
      earnedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'weekly',
      points: 30
    }
  ]
  res.json({ achievements })
})

userRouter.get('/workouts', requireAuth, (_req: AuthedRequest, res) => {
  // Demo workout library; later, load from DB and gate by subscription.
  res.json({
    workouts: [
      {
        id: 'w1',
        title: 'Home HIIT Blast',
        category: 'Home',
        difficulty: 'Intermediate',
        durationMinutes: 20
      },
      {
        id: 'w2',
        title: 'Full-Body Gym Strength',
        category: 'Gym',
        difficulty: 'Advanced',
        durationMinutes: 45
      },
      {
        id: 'w3',
        title: 'Morning Yoga Flow',
        category: 'Yoga',
        difficulty: 'Beginner',
        durationMinutes: 30
      },
      {
        id: 'w4',
        title: 'Bodyweight Core Burner',
        category: 'Bodyweight',
        difficulty: 'Intermediate',
        durationMinutes: 15
      }
    ]
  })
})

function validateCartItems(items: unknown): asserts items is IUser['workoutCart'] {
  if (!Array.isArray(items)) {
    throw new Error('Cart must be an array')
  }
  items.forEach((item) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.category !== 'string' ||
      typeof item.difficulty !== 'string' ||
      typeof item.durationMinutes !== 'number'
    ) {
      throw new Error('Invalid cart item')
    }
  })
}

userRouter.get('/cart', requireAuth, attachUserDoc, (req: AuthedRequest, res) => {
  return res.json({ items: req.userDoc?.workoutCart ?? [] })
})

userRouter.put('/cart', requireAuth, attachUserDoc, async (req: AuthedRequest, res) => {
  try {
    validateCartItems(req.body?.items)
  } catch (err) {
    return res.status(400).json({ error: (err as Error).message })
  }

  if (!req.userDoc) {
    return res.status(404).json({ error: 'User not found' })
  }

  if (!env.mongoUri) {
    return res.json({ items: req.body.items })
  }
  req.userDoc.workoutCart = req.body.items
  await req.userDoc.save()
  return res.json({ items: req.userDoc.workoutCart })
})

userRouter.post('/ai-plan', requireAuth, attachUserDoc, (req: AuthedRequest, res) => {
  const source: IUser['workoutCart'] = Array.isArray(req.body?.items) && req.body.items.length > 0 ? req.body.items : req.userDoc?.workoutCart ?? []

  if (source.length === 0) {
    return res.status(400).json({ error: 'No workouts provided for plan generation' })
  }

  const totalDuration = source.reduce((sum: number, item) => sum + item.durationMinutes, 0)
  const plan = {
    summary: `AI plan generated with ${source.length} workouts totaling ${totalDuration} minutes.`,
    schedule: source.map((item, index: number) => ({
      day: `Day ${index + 1}`,
      workoutId: item.id,
      title: item.title,
      focus: item.category
    })),
    recommendations: [
      'Include a rest or mobility session after every 3 intense workouts.',
      'Hydrate adequately and track calories to align with your subscription’s diet plan.'
    ]
  }

  return res.json({ plan })
})
