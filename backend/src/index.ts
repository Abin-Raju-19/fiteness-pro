import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.js'
import { meRouter } from './routes/me.js'
import { userRouter } from './routes/user.js'
import { subscriptionsRouter } from './routes/subscriptions.js'
import { stripeService } from './services/stripeService.js'
import { messagesRouter } from './routes/messages.js'

const app = express()

app.use(helmet())
app.use(cors({ 
  origin: [env.corsOrigin, 'http://localhost:5173', 'http://localhost:5174'], 
  credentials: true 
}))
app.options('*', cors({ 
  origin: [env.corsOrigin, 'http://localhost:5173', 'http://localhost:5174'], 
  credentials: true 
}))

app.use(cookieParser())
// Mount Stripe webhook BEFORE JSON body parser to preserve raw body
app.post('/subscriptions/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string
  try {
    // `req.body` is a Buffer when using express.raw
    await stripeService.handleWebhook((req.body as Buffer).toString(), sig)
    return res.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return res.status(400).json({ error: (error as Error).message })
  }
})

app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'fitness-backend',
    timestamp: new Date().toISOString()
  })
})

// Temporary debug endpoint to list registered routes
app.get('/_routes', (_req, res) => {
  // Return a static list of expected routes to avoid runtime type issues
  const routes = [
    { path: '/health', methods: ['get'] },
    { path: '/auth/*', methods: ['post'] },
    { path: '/me/*', methods: ['get','put'] },
    { path: '/user/*', methods: ['get','post','put'] },
    { path: '/subscriptions/create-checkout-session', methods: ['post'] },
    { path: '/subscriptions/create-portal-session', methods: ['post'] },
    { path: '/subscriptions/webhook', methods: ['post'] },
  ]
  res.json(routes)
})

// Local-only debug route to list users (no sensitive fields)
if (env.enableDebugRoutes) {
  app.get('/debug/users', async (_req, res) => {
    try {
      const users = await (await import('./models/User.js')).User.find().lean()
      // Ensure passwordHash is not sent
      const safe = users.map((u: Record<string, unknown>) => {
        const copy = { ...u }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (copy as any).passwordHash
        return copy
      })
      return res.json(safe)
    } catch (error) {
      console.error('Error fetching users for debug:', error)
      return res.status(500).json({ error: 'Failed to fetch users' })
    }
  })
}

app.use('/auth', authRouter)
app.use('/me', meRouter)
app.use('/user', userRouter)
app.use('/subscriptions', subscriptionsRouter)
app.use('/messages', messagesRouter)

export { app }


