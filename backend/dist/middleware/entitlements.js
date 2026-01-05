const PLAN_ENTITLEMENTS = {
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
};
export function attachEntitlements(req, _res, next) {
    const plan = req.user?.subscriptionPlan ?? null;
    if (!plan) {
        ;
        req.entitlements = null;
        return next();
    }
    ;
    req.entitlements =
        PLAN_ENTITLEMENTS[plan];
    return next();
}
