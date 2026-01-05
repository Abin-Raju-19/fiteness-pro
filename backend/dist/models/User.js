import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
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
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            // remove sensitive fields
            const result = ret;
            delete result.passwordHash;
            return result;
        }
    }
});
// Add indexes for subscription queries
userSchema.index({ subscriptionPlan: 1 });
userSchema.index({ subscriptionStatus: 1 });
export const User = mongoose.model('User', userSchema);
