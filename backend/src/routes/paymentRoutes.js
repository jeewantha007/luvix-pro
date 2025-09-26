import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { stripeWebhooks } from '../webhooks/stripeWebhooks.js';

const router = express.Router();

// Webhook endpoint for Stripe events (raw middleware applied at app level)
router.post('/webhook', stripeWebhooks.handleWebhook);

// Check system's complete subscription status
router.get('/subscription-status', paymentController.checkSubscriptionStatus);


// Get available subscription plans
router.get('/plans', paymentController.getSubscriptionPlans);

// Create subscription checkout session
router.post('/create-subscription-checkout', paymentController.createSubscriptionCheckout);

// Create Stripe Billing Portal session
router.post('/create-billing-portal-session', paymentController.createBillingPortalSession);

// Fetch raw subscription row
router.get('/subscription-record', paymentController.getSubscriptionRecord);

export default router;
