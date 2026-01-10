import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { stripeService } from '../services/stripeService.js';
import { razorpayService } from '../services/razorpayService.js';
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
// Razorpay demo checkout (order creation)
subscriptionsRouter.post('/razorpay/create-order', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { plan } = req.body;
    if (!plan) {
        return res.status(400).json({ error: 'Missing plan' });
    }
    try {
        const order = await razorpayService.createOrder(req.user.id, plan);
        return res.json(order);
    }
    catch (error) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
    }
});
// Razorpay demo checkout (signature verification)
subscriptionsRouter.post('/razorpay/verify', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
    if (!plan || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing payment fields' });
    }
    try {
        const ok = razorpayService.verifySignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });
        if (!ok) {
            return res.status(400).json({ error: 'Invalid Razorpay signature' });
        }
        await razorpayService.activateSubscription(req.user.id, plan, razorpay_payment_id);
        return res.json({ ok: true });
    }
    catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        return res.status(500).json({ error: 'Failed to verify Razorpay payment' });
    }
});
subscriptionsRouter.post('/webhook', async (req, res) => {
    // Webhook is handled at the application level (index.ts) using
    // express.raw to preserve the raw request body required by Stripe.
    return res.status(404).json({ error: 'Not found' });
});
