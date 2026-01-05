import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createCheckoutSession,
} from "../controllers/subscriptions.controller.js";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/razorpay.controller.js";

const router = Router();

// Existing Stripe-like route
router.post("/create-checkout-session", authMiddleware, createCheckoutSession);

// ✅ Add Razorpay routes here
router.post("/razorpay/create-order", authMiddleware, createRazorpayOrder);
router.post("/razorpay/verify", authMiddleware, verifyRazorpayPayment);

export default router;
