import Razorpay from 'razorpay'
import crypto from 'crypto'
import { env } from '../config/env.js'
import { User } from '../models/User.js'

export type RazorpayPlan = 'SILVER' | 'GOLD' | 'PLATINUM'

type CreateOrderResult = {
  keyId: string
  orderId: string
  amount: number
  currency: 'INR'
  name: string
  description: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
}

class RazorpayService {
  private client: Razorpay

  constructor() {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
      // Keep startup working, but throw only when route is called.
      // This makes local dev easier if you don't use Razorpay.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.client = null as any
      return
    }

    this.client = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    })
  }

  private getAmount(plan: RazorpayPlan): number {
    if (plan === 'SILVER') return env.razorpayAmountSilver
    if (plan === 'GOLD') return env.razorpayAmountGold
    return env.razorpayAmountPlatinum
  }

  async createOrder(userId: string, plan: RazorpayPlan): Promise<CreateOrderResult> {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
      throw new Error('Razorpay is not configured (missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)')
    }

    const user = await User.findById(userId).lean()
    if (!user) {
      throw new Error('User not found')
    }

    const amount = this.getAmount(plan)
    const receipt = `sub_${plan}_${Date.now()}`

    const order = await this.client.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: {
        plan,
        userId,
      },
    })

    return {
      keyId: env.razorpayKeyId,
      orderId: order.id,
      amount: order.amount,
      currency: 'INR',
      name: 'Fitness App',
      description: `Subscription - ${plan}`,
      prefill: {
        name: user.name,
        email: user.email,
      },
    }
  }

  verifySignature(opts: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = opts

    const body = `${razorpay_order_id}|${razorpay_payment_id}`
    const expected = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(body)
      .digest('hex')

    return expected === razorpay_signature
  }

  async activateSubscription(userId: string, plan: RazorpayPlan, paymentId: string): Promise<void> {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          subscriptionPlan: plan,
          subscriptionStatus: 'active',
          subscriptionId: paymentId,
          subscriptionUpdatedAt: new Date(),
        },
      }
    )
  }
}

export const razorpayService = new RazorpayService()
