import type { NextFunction, Response } from 'express'
import type { AuthedRequest } from './auth.js'

export type PlanCode = 'SILVER' | 'GOLD' | 'PLATINUM'

export interface Entitlements {
  maxActiveAiPlans: number
  maxFormFeedbackSessionsPerMonth: number
  progressHistoryWindowDays: number | 'unlimited'
  maxConcurrentDietPlans: number | 'unlimited'
  trainerChatAccess: 'none' | 'read' | 'full' | 'priority'
  liveSessionsPerMonth: number
  contentAccessLevel: 'basic' | 'advanced' | 'full'
  achievementLevel: 'basic' | 'extended' | 'pro'
  challengeFrequency: 'monthly' | 'biweekly' | 'weekly'
  wearableIntegrationLevel: 'steps' | 'standard' | 'full'
  dataExport: 'none' | 'csv' | 'csv+json'
}

const PLAN_ENTITLEMENTS: Record<PlanCode, Entitlements> = {
  SILVER: {
    maxActiveAiPlans: 1,
    maxFormFeedbackSessionsPerMonth: 0,
    progressHistoryWindowDays: 30,
    maxConcurrentDietPlans: 1,
    trainerChatAccess: 'read',
    liveSessionsPerMonth: 0,
    contentAccessLevel: 'basic',
    achievementLevel: 'basic',
    challengeFrequency: 'monthly',
    wearableIntegrationLevel: 'steps',
    dataExport: 'none'
  },
  GOLD: {
    maxActiveAiPlans: 3,
    maxFormFeedbackSessionsPerMonth: 2,
    progressHistoryWindowDays: 180,
    maxConcurrentDietPlans: 3,
    trainerChatAccess: 'full',
    liveSessionsPerMonth: 1,
    contentAccessLevel: 'advanced',
    achievementLevel: 'extended',
    challengeFrequency: 'biweekly',
    wearableIntegrationLevel: 'standard',
    dataExport: 'csv'
  },
  PLATINUM: {
    maxActiveAiPlans: Number.MAX_SAFE_INTEGER,
    maxFormFeedbackSessionsPerMonth: 8,
    progressHistoryWindowDays: 'unlimited',
    maxConcurrentDietPlans: 'unlimited',
    trainerChatAccess: 'priority',
    liveSessionsPerMonth: 4,
    contentAccessLevel: 'full',
    achievementLevel: 'pro',
    challengeFrequency: 'weekly',
    wearableIntegrationLevel: 'full',
    dataExport: 'csv+json'
  }
}

export function attachEntitlements(req: AuthedRequest, _res: Response, next: NextFunction) {
  const plan = (req.user?.subscriptionPlan as PlanCode | null) ?? null
  if (!plan) {
    ;(req as AuthedRequest & { entitlements?: Entitlements | null }).entitlements = null
    return next()
  }

  ;(req as AuthedRequest & { entitlements?: Entitlements | null }).entitlements =
    PLAN_ENTITLEMENTS[plan]

  return next()
}


