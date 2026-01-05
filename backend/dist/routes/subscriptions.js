import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { stripeService } from '../services/stripeService.js';
export const subscriptionsRouter = Router();
subscriptionsRouter.post('/create-checkout-session', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { plan, successUrl, cancelUrl } = req.body;
    if (!plan) {
        return res.status(400).json({ error: 'Missing plan' });
    }
    try {
        const sessionUrl = await stripeService.createCheckoutSession({
            userId: req.user.id,
            plan,
            successUrl,
            cancelUrl
        });
        return res.json({ url: sessionUrl });
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        return res.status(500).json({ error: 'Failed to create checkout session' });
    }
});
subscriptionsRouter.post('/create-portal-session', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { returnUrl } = req.body;
    try {
        const portalUrl = await stripeService.createCustomerPortalSession(req.user.id, returnUrl);
        return res.json({ url: portalUrl });
    }
    catch (error) {
        console.error('Error creating customer portal session:', error);
        return res
            .status(500)
            .json({ error: 'Failed to create customer portal session' });
    }
});
subscriptionsRouter.post('/webhook', async (req, res) => {
    // Webhook is handled at the application level (index.ts) using
    // express.raw to preserve the raw request body required by Stripe.
    return res.status(404).json({ error: 'Not found' });
});
