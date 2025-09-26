// Simple webhook test script
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test webhook signature verification
export function testWebhookSignature() {
  console.log('🧪 Testing webhook signature verification...');
  
  const testPayload = JSON.stringify({
    id: 'evt_test_123',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        metadata: {
          userId: 'test-user-id',
          paymentType: 'subscription'
        }
      }
    }
  });

  const testSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!testSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not set');
    return;
  }

  try {
    // Create a test signature
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: testPayload,
      secret: testSecret,
      timestamp: timestamp
    });

    console.log('✅ Test signature generated:', signature.substring(0, 50) + '...');
    
    // Verify the signature
    const event = stripe.webhooks.constructEvent(testPayload, signature, testSecret);
    console.log('✅ Signature verification successful:', event.type);
    
  } catch (error) {
    console.error('❌ Signature verification failed:', error.message);
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWebhookSignature();
}
