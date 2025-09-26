import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe // Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

// Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })
  : null;

export const paymentController = {
  // Create a Stripe Billing Portal session and return redirect URL
  async createBillingPortalSession(req, res) {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Payments not configured (missing STRIPE_SECRET_KEY)' });
      }
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const { data: subscriptionRow, error } = await supabaseAdmin
        .from('user_subscriptions')
        .select('stripe_customer_id')
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch subscription record' });
      }
      if (!subscriptionRow?.stripe_customer_id) {
        return res.status(404).json({ error: 'Stripe customer not found' });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: subscriptionRow.stripe_customer_id,
        return_url: `${process.env.FRONTEND_URL || ''}/settings`
      });

      return res.json({ url: session.url });
    } catch (err) {
      console.error('Create Billing Portal session error:', err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  },
  // Check system subscription status (single row)
  async checkSubscriptionStatus(req, res) {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const { data: subscription, error } = await supabaseAdmin
        .from('user_subscriptions')
        .select('status, plan_id, billing_cycle, current_period_end, next_billing_date, cancel_at_period_end, cancel_at')
        .maybeSingle(); // fetch single row

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch subscription status' });
      }

      if (!subscription) {
        // No subscription exists → redirect to plan selection
        return res.json({
          hasSubscription: false,
          isActive: false,
          status: null,
          redirectTo: '/subscription'
        });
      }

      const isActive = subscription.status === 'active';
      return res.json({
        hasSubscription: true,
        isActive,
        status: subscription.status,
        planId: subscription.plan_id,
        billingCycle: subscription.billing_cycle,
        currentPeriodEnd: subscription.current_period_end,
        nextBillingDate: subscription.next_billing_date,
        cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
        cancelAt: subscription.cancel_at,
        redirectTo: isActive ? null : '/subscription'
      });

    } catch (err) {
      console.error('Check subscription status error:', err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  },

  // Fetch available subscription plans
  async getSubscriptionPlans(req, res) {
    try {
      if (!supabaseAdmin) {
        return res.json({
          plans: [
            { id: 'demo', name: 'Monthly Plan', plan_type: 'monthly', price: 99.00, features: ['Demo Feature 1','Demo Feature 2'] },
            { id: 'demo-yearly', name: 'Yearly Plan', plan_type: 'yearly', price: 990.00, features: ['Demo Feature 1','Demo Feature 2'] }
          ],
          note: 'Database not configured - using demo plans'
        });
      }

      const { data: plans, error } = await supabaseAdmin
        .from('subscription_plans')
        .select('id, name, plan_type, price, stripe_price_id, features')
        .eq('is_active', true)
        .eq('plan_type', 'monthly')
        .order('price', { ascending: true });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch subscription plans' });
      }

      return res.json({ plans });

    } catch (err) {
      console.error('Get subscription plans error:', err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  },

  // Create subscription checkout session (single row system)
  async createSubscriptionCheckout(req, res) {
    try {
      const { subscription_plan_id } = req.body;
      if (!subscription_plan_id) {
        return res.status(400).json({ error: 'subscription_plan_id is required' });
      }

      if (!stripe) {
        return res.status(500).json({ error: 'Payments not configured (missing STRIPE_SECRET_KEY)' });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      // Get existing subscription row
      let { data: subscriptionRow, error: subErr } = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .maybeSingle();

      if (subErr) {
        return res.status(500).json({ error: 'Failed to fetch subscription record' });
      }

      // Get subscription plan
      const { data: plan, error: planError } = await supabaseAdmin
        .from('subscription_plans')
        .select('*')
        .eq('id', subscription_plan_id)
        .eq('is_active', true)
        .single();

      if (planError || !plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Create or fetch Stripe customer
      let stripeCustomerId = subscriptionRow?.stripe_customer_id || null;
      if (!stripeCustomerId) {
        let customer = null;
        try {
          const customers = await stripe.customers.list({ limit: 1 });
          customer = customers.data.length ? customers.data[0] : null;
        } catch (_) { customer = null; }

        if (!customer) {
          customer = await stripe.customers.create({ metadata: { system: 'dedicated' } });
        }
        stripeCustomerId = customer.id;
      }

      // Prepare subscription row data
      const now = new Date();
      const currentPeriodStart = now;
      const currentPeriodEnd = plan.plan_type === 'monthly'
        ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const subscriptionData = {
        plan_id: plan.id,
        stripe_customer_id: stripeCustomerId,
        billing_cycle: plan.plan_type,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        next_billing_date: currentPeriodEnd.toISOString(),
        status: 'pending_payment',
        updated_at: now.toISOString()
      };

      if (subscriptionRow) {
        // Update existing row
        const { error: updateErr } = await supabaseAdmin
          .from('user_subscriptions')
          .update(subscriptionData)
          .eq('id', subscriptionRow.id);
        if (updateErr) return res.status(500).json({ error: 'Failed to update subscription record' });
      } else {
        // Insert new row
        const { error: insertErr } = await supabaseAdmin
          .from('user_subscriptions')
          .insert(subscriptionData);
        if (insertErr) return res.status(500).json({ error: 'Failed to create subscription record' });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        metadata: { paymentType: 'subscription', planId: plan.id }
      });

      return res.json({ checkoutUrl: session.url, sessionId: session.id });

    } catch (err) {
      console.error('Create subscription checkout error:', err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  },

  // Optional: fetch raw subscription row
  async getSubscriptionRecord(req, res) {
    try {
      if (!supabaseAdmin) {
        return res.json({ subscription: null, note: 'Database not configured' });
      }

      const { data, error } = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch subscription record' });
      }

      return res.json({ subscription: data || null });

    } catch (err) {
      console.error('Get subscription record error:', err);
      return res.status(500).json({ error: 'Unexpected error' });
    }
  }
  ,
  
};
