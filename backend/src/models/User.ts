import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'user' | 'trainer' | 'admin'
export type SubscriptionPlan = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid' | 'paused' | 'expired'

export interface IUser extends Document {
  email: string
  passwordHash: string
  role: UserRole
  name: string
  secretCode?: string
  
  // Subscription fields
  subscriptionPlan: SubscriptionPlan
  subscriptionStatus: SubscriptionStatus
  subscriptionId?: string
  stripeCustomerId?: string
  // Hashed refresh token for cookie-based refresh flow
  refreshTokenHash?: string
  subscriptionUpdatedAt: Date
  
  // Usage tracking
  aiWorkoutsUsed: number
  trainerChatsUsed: number
  
  // Workout cart
  workoutCart: Array<{
    id: string
    title: string
    category: string
    difficulty: string
    durationMinutes: number
  }>

  // Diet plan
  dietPlan?: {
    calories: number
    protein: number
    carbs: number
    fats: number
    meals: Array<{
      name: string
      items: Array<{
        name: string
        imageUrl?: string
      }>
      calories: number
    }>
  }

  // Assigned workout plan
  workoutPlan?: {
    summary: string
    schedule: Array<{
      day: string
      workoutId: string
      title: string
      focus: string
    }>
    recommendations: string[]
  }
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      enum: ['user', 'trainer', 'admin'],
      default: 'user'
    },
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    secretCode: { 
      type: String,
      trim: true 
    },
    
    // Subscription fields
    subscriptionPlan: {
      type: String,
      enum: ['FREE', 'SILVER', 'GOLD', 'PLATINUM'],
      default: 'FREE'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid', 'paused', 'expired'],
      default: 'unpaid'
    },
    subscriptionId: {
      type: String,
      sparse: true
    },
    stripeCustomerId: {
      type: String,
      sparse: true
    },
    // Hashed refresh token for cookie-based refresh flow
    refreshTokenHash: {
      type: String,
      sparse: true
    },
    subscriptionUpdatedAt: {
      type: Date,
      default: Date.now
    },
    
    // Usage tracking
    aiWorkoutsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    trainerChatsUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    
    // Workout cart
    workoutCart: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          category: { type: String, required: true },
          difficulty: { type: String, required: true },
          durationMinutes: { type: Number, required: true }
        }
      ],
      default: []
    },

    // Diet plan
    dietPlan: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fats: Number,
      meals: [
        {
          name: String,
          items: [{
            name: String,
            imageUrl: String
          }],
          calories: Number
        }
      ]
    },

    // Assigned workout plan
    workoutPlan: {
      summary: String,
      schedule: [{
        day: String,
        workoutId: String,
        title: String,
        focus: String
      }],
      recommendations: [String]
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret: unknown) => {
        // remove sensitive fields
        const result = ret as Partial<IUser>
        delete result.passwordHash
        return result
      }
    }
  }
)

// Add indexes for subscription queries
userSchema.index({ subscriptionPlan: 1 })
userSchema.index({ subscriptionStatus: 1 })

export const User = mongoose.model<IUser>('User', userSchema)