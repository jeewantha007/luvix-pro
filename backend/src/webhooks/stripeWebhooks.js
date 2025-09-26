import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export const stripeWebhooks = {
  // Handle Stripe webhook events
  async handleWebhook(req, res) {
    console.log('🔔 Webhook received:', {
      headers: req.headers,
      bodyLength: req.body?.length,
      contentType: req.headers['content-type']
    });

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    console.log('🔐 Webhook signature check:', {
      hasSignature: !!sig,
      hasEndpointSecret: !!endpointSecret,
      endpointSecretPrefix: endpointSecret?.substring(0, 10) + '...'
    });

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log('✅ Webhook signature verified:', {
        eventId: event.id,
        eventType: event.type,
        created: event.created
      });
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', {
        error: err.message,
        hasSignature: !!sig,
        hasEndpointSecret: !!endpointSecret
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('📋 Processing event:', {
      type: event.type,
      id: event.id,
      data: event.data
    });

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('🛒 Processing checkout.session.completed');
          await handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          console.log('💰 Processing invoice.payment_succeeded');
          await handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          console.log('⚠️ Processing invoice.payment_failed');
          await handleInvoicePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.updated':
          console.log('🔄 Processing customer.subscription.updated');
          await handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          console.log('🗑️ Processing customer.subscription.deleted');
          await handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('❌ Error processing webhook event:', {
        eventType: event.type,
        eventId: event.id,
        error: error.message,
        stack: error.stack
      });
      return res.status(500).json({ error: 'Failed to process webhook event' });
    }

    console.log('✅ Webhook processed successfully');
    res.json({ received: true });
  }
};

// Utility: get or init the single subscription row id
async function getSingleSubscriptionRowId() {
  if (!supabaseAdmin) return null;
  const { data: existing, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id')
    .maybeSingle();
  if (error) {
    console.error('❌ Failed to fetch subscription row id:', error);
    return null;
  }
  if (existing?.id) return existing.id;
  // create an empty row if none exists
  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from('user_subscriptions')
    .insert({ status: 'pending_payment' })
    .select('id')
    .maybeSingle();
  if (insertErr) {
    console.error('❌ Failed to initialize subscription row:', insertErr);
    return null;
  }
  return inserted?.id || null;
}

// Handle successful checkout session completion (single-subscription system)
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('🛒 Checkout session data:', {
      sessionId: session.id,
      amountTotal: session.amount_total,
      customer: session.customer,
      subscription: session.subscription,
      paymentIntent: session.payment_intent,
      metadata: session.metadata
    });

    const { paymentType, planId } = session.metadata || {};

    console.log('📋 Extracted metadata:', {
      userId,
      paymentType,
      planId,
      hasMetadata: !!session.metadata
    });

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not configured');
      return;
    }

    if (paymentType === 'subscription') {
      const rowId = await getSingleSubscriptionRowId();
      if (!rowId) return;

      // Update system subscription to active
      const { data: updateData, error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          plan_id: planId,
          stripe_subscription_id: session.subscription,
          status: 'active'
        })
        .eq('id', rowId)
        .select();

      console.log('📝 Subscription update result (system):', { updateData, error });
      if (error) {
        console.error('❌ Failed to update subscription status:', error);
        return;
      }

      // Record the payment (no user linkage in single-subscription system)
      const { data: paymentData, error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          amount: (session.amount_total || 0) / 100,
          type: 'subscription',
          status: 'succeeded',
          stripe_payment_id: session.payment_intent
        })
        .select();

      console.log('💰 Payment record result:', { paymentData, paymentError });
      if (paymentError) {
        console.error('❌ Failed to record payment:', paymentError);
      }

      console.log('✅ Subscription activated for system');
    } else {
      console.log('ℹ️ Unknown payment type:', paymentType);
    }
  } catch (error) {
    console.error('❌ Error handling checkout session completed:', {
      error: error.message,
      stack: error.stack
    });
  }
}

// Handle successful invoice payment (for recurring subscriptions) - single-subscription system
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    if (!supabaseAdmin) return;

    // Record the payment
    await supabaseAdmin
      .from('payments')
      .insert({
        amount: (invoice.amount_paid || 0) / 100,
        type: 'subscription',
        status: 'succeeded',
        stripe_payment_id: invoice.payment_intent
      });

    // Set subscription active and sync dates
    const rowId = await getSingleSubscriptionRowId();
    if (rowId) {
      const currentPeriodEnd = invoice.lines?.data?.[0]?.period?.end
        ? new Date(invoice.lines.data[0].period.end * 1000).toISOString()
        : undefined;

      await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_end: currentPeriodEnd,
          next_billing_date: currentPeriodEnd,
          updated_at: new Date().toISOString()
        })
        .eq('id', rowId);
    }

    console.log('Recurring payment recorded and subscription set to active');
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  try {
    if (!supabaseAdmin) return;
    const rowId = await getSingleSubscriptionRowId();
    if (!rowId) return;

    const nextAttempt = invoice.next_payment_attempt
      ? new Date(invoice.next_payment_attempt * 1000).toISOString()
      : null;

    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'past_due',
        next_billing_date: nextAttempt,
        updated_at: new Date().toISOString()
      })
      .eq('id', rowId);

    // Optionally record a failed payment event
    await supabaseAdmin
      .from('payments')
      .insert({
        amount: (invoice.amount_due || 0) / 100,
        type: 'subscription',
        status: 'failed',
        stripe_payment_id: invoice.payment_intent || null
      });

    console.log('Subscription set to past_due after failed invoice');
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

// Handle subscription updates - single-subscription system
async function handleSubscriptionUpdated(subscription) {
  try {
    if (!supabaseAdmin) return;
    const rowId = await getSingleSubscriptionRowId();
    if (!rowId) return;

    let status = 'active';
    if (subscription.status === 'past_due') status = 'past_due';
    if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'incomplete_expired') {
      status = 'expired';
    }

    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : undefined;

  const cancelAtPeriodEnd = Boolean(subscription.cancel_at_period_end);
  const cancelAtTs = subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null;

  const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status,
        stripe_subscription_id: subscription.id,
        current_period_end: currentPeriodEnd,
      next_billing_date: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      cancel_at: cancelAtTs,
        updated_at: new Date().toISOString()
      })
      .eq('id', rowId);

    if (error) {
      console.error('❌ Failed updating subscription status:', error);
    } else {
      console.log(`Subscription status updated to ${status} for system`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deletion - single-subscription system
async function handleSubscriptionDeleted(subscription) {
  try {
    if (!supabaseAdmin) return;
    const rowId = await getSingleSubscriptionRowId();
    if (!rowId) return;

    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        status: 'expired',
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      cancel_at: null,
      updated_at: new Date().toISOString()
      })
      .eq('id', rowId);

    if (error) {
      console.error('❌ Failed expiring subscription:', error);
    } else {
      console.log('Subscription expired for system');
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}
