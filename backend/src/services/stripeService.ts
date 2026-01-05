import Stripe from 'stripe'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  : null

// Subscription plan configuration
export const SUBSCRIPTION_PLANS = {
  SILVER: {
    code: 'SILVER',
    name: 'Silver',
    priceId: env.stripePriceSilver,
    features: ['Basic workout library', '1 AI workout plan', '30 days history'],
    limits: {
      aiWorkouts: 1,
      trainerChats: 0,
      historyDays: 30,
    }
  },
  GOLD: {
    code: 'GOLD',
    name: 'Gold',
    priceId: env.stripePriceGold,
    features: ['Advanced content', '3 AI plans', 'Trainer chat', '6 months history'],
    limits: {
      aiWorkouts: 3,
      trainerChats: 10,
      historyDays: 180,
    }
  },
  PLATINUM: {
    code: 'PLATINUM',
    name: 'Platinum',
    priceId: env.stripePricePlatinum,
    features: ['Unlimited AI plans', 'Priority trainer support', 'Full history'],
    limits: {
      aiWorkouts: -1, // -1 means unlimited
      trainerChats: -1,
      historyDays: -1,
    }
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

export interface CreateCheckoutSessionOptions {
  userId: string
  plan: SubscriptionPlan
  successUrl?: string
  cancelUrl?: string
  customerEmail?: string
}

export interface SubscriptionUsage {
  aiWorkoutsUsed: number
  trainerChatsUsed: number
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

class StripeService {
  private stripe: Stripe | null

  constructor() {
    this.stripe = stripe
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(options: CreateCheckoutSessionOptions): Promise<string> {
    if (!this.stripe) {
      if ((env.nodeEnv ?? 'development') !== 'production') {
        return `${env.corsOrigin}/subscription/success?session_id=dev_mock`
      }
      throw new Error('Stripe is not configured')
    }
    const { userId, plan, successUrl, cancelUrl, customerEmail } = options
    const planConfig = SUBSCRIPTION_PLANS[plan]

    if (!planConfig.priceId) {
      if ((env.nodeEnv ?? 'development') !== 'production') {
        return successUrl || `${env.corsOrigin}/subscription/success?session_id=dev_mock`
      }
      throw new Error(`Price ID not configured for plan: ${plan}`)
    }

    // Get or create Stripe customer
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    if (user.subscriptionStatus === 'canceled') {
        throw new Error('You cannot subscribe while your previous subscription is being canceled.')
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email: customerEmail || user.email,
        metadata: {
          userId: userId.toString(),
        }
      })
      customerId = customer.id

      // Save Stripe customer ID to user
      user.stripeCustomerId = customerId
      await user.save()
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [{
          price: planConfig.priceId,
          quantity: 1,
        }],
        success_url: successUrl || `${env.corsOrigin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${env.corsOrigin}/subscription/cancel`,
        metadata: {
          userId: userId.toString(),
          plan: plan,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      })
      return session.url!
    } catch {
      if ((env.nodeEnv ?? 'development') !== 'production') {
        return successUrl || `${env.corsOrigin}/subscription/success?session_id=dev_mock`
      }
      throw new Error('Failed to create checkout session')
    }
  }

  /**
   * Create a Stripe customer portal session
   */
  async createCustomerPortalSession(userId: string, returnUrl?: string): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured')
    }
    const user = await User.findById(userId)
    if (!user || !user.stripeCustomerId) {
      throw new Error('User does not have a Stripe customer ID')
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${env.corsOrigin}/account/billing`,
    })

    return session.url
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: string, signature: string): Promise<void> {
    if (!this.stripe || !env.stripeWebhookSecret) {
      throw new Error('Stripe webhook is not configured')
    }
    let event: Stripe.Event

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        env.stripeWebhookSecret
      )
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error}`)
    }

    await this.processWebhookEvent(event)
  }

  /**
   * Process different Stripe webhook events
   */
  private async processWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }
      case 'customer.subscription.created': {
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      }
      case 'customer.subscription.updated': {
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      }
      case 'customer.subscription.deleted': {
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }
      case 'invoice.payment_succeeded': {
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      }
      case 'invoice.payment_failed': {
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }
      default: {
        console.log(`Unhandled event type: ${event.type}`)
      }
    }
  }

  /**
   * Handle checkout session completion
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId
    const plan = session.metadata?.plan as SubscriptionPlan

    if (!userId || !plan) {
      console.error('Missing userId or plan in session metadata')
      return
    }

    const user = await User.findById(userId)
    if (!user) {
      console.error('User not found:', userId)
      return
    }

    // Update user's subscription status
    user.subscriptionPlan = plan
    user.subscriptionStatus = 'active'
    user.subscriptionId = session.subscription as string
    user.subscriptionUpdatedAt = new Date()

    await user.save()

    console.log(`User ${userId} subscribed to ${plan} plan`)
  }

  /**
   * Handle subscription creation
   */
  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    user.subscriptionStatus = 'active'
    user.subscriptionId = subscription.id
    user.subscriptionUpdatedAt = new Date()

    await user.save()
  }

  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Update subscription status based on Stripe subscription status
    user.subscriptionStatus = subscription.status
    user.subscriptionUpdatedAt = new Date()

    await user.save()
  }

  /**
   * Handle subscription deletion (cancellation)
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId = subscription.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Reset user's subscription
    user.subscriptionPlan = 'FREE'
    user.subscriptionStatus = 'canceled'
    user.subscriptionId = undefined
    user.subscriptionUpdatedAt = new Date()

    await user.save()

    console.log(`User ${user.id} subscription canceled`)
  }

  /**
   * Handle successful invoice payment
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Reset usage counters for the new billing period
    user.aiWorkoutsUsed = 0
    user.trainerChatsUsed = 0
    user.subscriptionUpdatedAt = new Date()

    await user.save()

    console.log(`Payment succeeded for user ${user.id}`)
  }

  /**
   * Handle failed invoice payment
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Mark subscription as past due
    user.subscriptionStatus = 'past_due'
    user.subscriptionUpdatedAt = new Date()

    await user.save()

    console.log(`Payment failed for user ${user.id}`)
  }

  /**
   * Get subscription details for a user
   */
  async getSubscriptionDetails(userId: string): Promise<{
    plan: SubscriptionPlan | 'FREE'
    status: string
    currentPeriodEnd?: Date
    usage: SubscriptionUsage
  } | null> {
    const user = await User.findById(userId)
    if (!user) {
      return null
    }

    let currentPeriodEnd: Date | undefined
    if (user.subscriptionId && this.stripe) {
      try {
        const subscription = await this.stripe.subscriptions.retrieve(user.subscriptionId)
        currentPeriodEnd = new Date(subscription.current_period_end * 1000)
      } catch (error) {
        console.error('Error fetching subscription:', error)
      }
    }

    return {
      plan: user.subscriptionPlan || 'FREE',
      status: user.subscriptionStatus || 'inactive',
      currentPeriodEnd,
      usage: {
        aiWorkoutsUsed: user.aiWorkoutsUsed || 0,
        trainerChatsUsed: user.trainerChatsUsed || 0,
        currentPeriodStart: user.subscriptionUpdatedAt || new Date(),
        currentPeriodEnd: currentPeriodEnd || new Date(),
      }
    }
  }

  /**
   * Check if user has exceeded their subscription limits
   */
  async checkSubscriptionLimits(userId: string, feature: 'aiWorkouts' | 'trainerChats'): Promise<{
    allowed: boolean
    limit: number
    used: number
    remaining: number
  }> {
    const user = await User.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    const plan = SUBSCRIPTION_PLANS[user.subscriptionPlan as SubscriptionPlan]
    if (!plan) {
      // Free tier or unknown plan
      return {
        allowed: false,
        limit: 0,
        used: 0,
        remaining: 0
      }
    }

    const limit = plan.limits[feature]
    if (limit === -1) {
      // Unlimited
      return {
        allowed: true,
        limit: -1,
        used: 0,
        remaining: -1
      }
    }

    const used = feature === 'aiWorkouts' ? user.aiWorkoutsUsed : user.trainerChatsUsed
    const remaining = Math.max(0, limit - used)

    return {
      allowed: remaining > 0,
      limit,
      used,
      remaining
    }
  }

  /**
   * Increment usage counter for a feature
   */
  async incrementUsage(userId: string, feature: 'aiWorkouts' | 'trainerChats'): Promise<void> {
    const update = feature === 'aiWorkouts' 
      ? { $inc: { aiWorkoutsUsed: 1 } }
      : { $inc: { trainerChatsUsed: 1 } }

    await User.findByIdAndUpdate(userId, update)
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    if (!this.stripe) {
      throw new Error('Stripe is not configured')
    }
    const user = await User.findById(userId)
    if (!user || !user.subscriptionId) {
      throw new Error('User or subscription not found')
    }

    try {
      // Use the Stripe API method to delete the subscription
      await this.stripe.subscriptions.cancel(user.subscriptionId)

      // Update user status
      user.subscriptionStatus = 'canceled'
      user.subscriptionId = undefined
      user.subscriptionUpdatedAt = new Date()
      await user.save()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw new Error('Failed to cancel subscription')
    }
  }
}

export const stripeService = new StripeService()
export default stripeService
