import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { User } from '../models/User.js';
export const trainerRouter = Router();
// Apply auth and role check to all routes
trainerRouter.use(requireAuth, requireRole('trainer'));
// Get all athletes (users)
trainerRouter.get('/athletes', async (req, res) => {
    try {
        // In a real app, you might only return users assigned to this trainer
        // For now, return all users with role 'user'
        const athletes = await User.find({ role: 'user' })
            .select('name email subscriptionPlan subscriptionStatus workoutPlan')
            .lean();
        return res.json({ athletes });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to fetch athletes' });
    }
});
// Assign workout plan to an athlete
trainerRouter.post('/assign-plan', async (req, res) => {
    const { userId, plan } = req.body;
    if (!userId || !plan) {
        return res.status(400).json({ error: 'Missing userId or plan' });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.workoutPlan = plan;
        user.markModified('workoutPlan');
        await user.save();
        return res.json({ success: true, workoutPlan: user.workoutPlan });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to assign plan' });
    }
});
// Assign diet plan to an athlete
trainerRouter.post('/assign-diet-plan', async (req, res) => {
    const { userId, dietPlan } = req.body;
    if (!userId || !dietPlan) {
        return res.status(400).json({ error: 'Missing userId or dietPlan' });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.dietPlan = dietPlan;
        user.markModified('dietPlan');
        await user.save();
        return res.json({ success: true, dietPlan: user.dietPlan });
    }
    catch (err) {
        return res.status(500).json({ error: 'Failed to assign diet plan' });
    }
});
// Start live session
trainerRouter.post('/live-session', async (req, res) => {
    // Mock logic to create a session
    const sessionId = Math.random().toString(36).substring(7);
    // For demo purposes, we can return a generic meeting link or a placeholder
    const sessionUrl = `https://meet.google.com/landing`;
    return res.json({
        sessionId,
        sessionUrl,
        status: 'active',
        startedAt: new Date()
    });
});
