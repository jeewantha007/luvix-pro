import { createClient } from '@supabase/supabase-js';

// Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export async function requireActiveSubscription(req, res, next) {
  try {
    if (!supabaseAdmin) {
      console.error('Database not configured');
      return res.status(500).json({ error: 'Database not configured' });
    }

    // Fetch the single subscription row
    const { data: subscription, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('status, plan_id')
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch subscription:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription status' });
    }

    // Block access if no row or subscription not active
    if (!subscription || subscription.status !== 'active' || !subscription.plan_id) {
      return res.status(403).json({
        error: 'Subscription required',
        message: 'You need an active subscription to access this service',
        redirectTo: '/subscription' // frontend can use this to redirect
      });
    }

    // Subscription active → allow access
    req.subscriptionStatus = {
      status: subscription.status,
      planId: subscription.plan_id
    };
    next();

  } catch (err) {
    console.error('Subscription middleware error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
}
