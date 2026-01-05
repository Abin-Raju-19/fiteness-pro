import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { SubscriptionPlan, User } from '../models/User.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/jwt.js'
import { env } from '../config/env.js'

const TRAINER_CODE = env.trainerSecret
const ADMIN_CODE = env.adminSecret

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const { email, password, name, role = 'user', secretCode } = req.body as 
  {
    email: string
    password: string
    name: string
    role?: 'user' | 'trainer' | 'admin'
    secretCode?: string
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (role === 'trainer' && secretCode !== TRAINER_CODE) {
    return res.status(403).json({ error: 'Invalid trainer code' })
  }

  if (role === 'admin' && secretCode !== ADMIN_CODE) {
    return res.status(403).json({ error: 'Invalid admin code' })
  }

  if (env.mongoUri) {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' })
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = env.mongoUri
    ? await User.create({
        email,
        passwordHash,
        name,
        role,
        secretCode: role === 'user' ? undefined : secretCode,
        subscriptionPlan: 'FREE'
      })
    : null

  if (!user) {
    return res.status(500).json({ error: 'Failed to create user' })
  }

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    subscriptionPlan: user.subscriptionPlan
  })
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role, subscriptionPlan: user.subscriptionPlan })
  const hashed = await bcrypt.hash(refreshToken, 10)
  user.refreshTokenHash = hashed
  await user.save()

  // set HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      subscriptionPlan: user.subscriptionPlan
    },
    accessToken
  })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string }

  const user = env.mongoUri
    ? await User.findOne({ email })
    : null

  if (!user) {
    // Developer debug log — does not expose details to clients.
    // Useful when running locally to see whether the email exists.
    console.debug(`Login failed: user not found for email=${email}`)
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  if (env.mongoUri) {
    const valid = await bcrypt.compare(password, (user as { passwordHash: string }).passwordHash)
    if (!valid) {
      console.debug(`Login failed: invalid password for email=${email}`)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
  }

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role as 'user' | 'trainer' | 'admin',
    subscriptionPlan: user.subscriptionPlan as SubscriptionPlan 
  })
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role as 'user' | 'trainer' | 'admin', subscriptionPlan: user.subscriptionPlan as SubscriptionPlan })

  // Store hashed refresh token on the user for server-side validation
  const hashed = await bcrypt.hash(refreshToken, 10)
  user.refreshTokenHash = hashed
  await user.save()

  // Set HttpOnly cookie with refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role as 'user' | 'trainer' | 'admin',
      name: user.name,
      subscriptionPlan: user.subscriptionPlan as SubscriptionPlan 
    },
    accessToken
  })
})


authRouter.post('/refresh', async (req, res) => {
  const cookieToken = req.cookies?.refreshToken as string | undefined
  if (!cookieToken) {
    return res.status(400).json({ error: 'Missing refresh token cookie' })
  }

  try {
    const payload = verifyRefreshToken(cookieToken)
    // Find the user and verify stored hash matches
    const user = await User.findById(payload.sub)
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const valid = await bcrypt.compare(cookieToken, user.refreshTokenHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    // Issue new tokens and rotate refresh token
    const accessToken = signAccessToken({ sub: payload.sub, role: payload.role, subscriptionPlan: payload.subscriptionPlan })
    const newRefreshToken = signRefreshToken({ sub: payload.sub, role: payload.role, subscriptionPlan: payload.subscriptionPlan })
    const newHash = await bcrypt.hash(newRefreshToken, 10)
    user.refreshTokenHash = newHash
    await user.save()

    // Set cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({ accessToken })
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
})

// Logout: clear refresh token cookie and remove stored hash
authRouter.post('/logout', async (req, res) => {
  try {
    const cookieToken = req.cookies?.refreshToken as string | undefined
    if (cookieToken) {
      try {
        const payload = verifyRefreshToken(cookieToken)
        const user = await User.findById(payload.sub)
        if (user) {
          user.refreshTokenHash = undefined
          await user.save()
        }
      } catch {
        // ignore
      }
    }
    res.clearCookie('refreshToken')
    return res.json({ ok: true })
  } catch (error) {
    console.error('Error during logout:', error)
    return res.status(500).json({ error: 'Failed to logout' })
  }
})
