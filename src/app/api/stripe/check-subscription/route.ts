import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Configuração de pagamento não encontrada' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Search for customers with this email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 10,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        hasActiveSubscription: false,
        reason: 'no_customer',
      });
    }

    // Check subscriptions for each customer
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 10,
      });

      // Check if any subscription is active or trialing
      const hasActive = subscriptions.data.some(
        (sub) => sub.status === 'active' || sub.status === 'trialing'
      );

      if (hasActive) {
        return NextResponse.json({
          hasActiveSubscription: true,
        });
      }
    }

    // No active subscription found
    return NextResponse.json({
      hasActiveSubscription: false,
      reason: 'no_active_subscription',
    });
  } catch (error) {
    console.error('Stripe check error:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar assinatura' },
      { status: 500 }
    );
  }
}
