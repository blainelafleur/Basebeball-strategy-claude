import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleSuccessfulPayment(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleFailedPayment(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Get the user associated with this customer
  const user = await prisma.user.findFirst({
    include: { subscription: true },
    where: {
      subscription: {
        stripeCustomerId: customerId,
      },
    },
  });

  if (!user) {
    console.error('No user found for customer:', customerId);
    return;
  }

  // Determine the plan based on the price ID
  const priceId = subscription.items.data[0]?.price.id;
  let plan: 'PRO' | 'TEAM' = 'PRO';

  if (priceId === process.env.STRIPE_TEAM_MONTHLY_PRICE_ID) {
    plan = 'TEAM';
  }

  // Update or create subscription record
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      plan: plan,
      active: subscription.status === 'active',
    },
    create: {
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      plan: plan,
      active: subscription.status === 'active',
    },
  });

  // Update user role
  await prisma.user.update({
    where: { id: user.id },
    data: { role: plan },
  });
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    include: { subscription: true },
    where: {
      subscription: {
        stripeCustomerId: customerId,
      },
    },
  });

  if (!user) return;

  // Deactivate subscription and revert to FREE plan
  await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      active: false,
      plan: 'FREE',
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'FREE' },
  });
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  // Handle successful payment logic
  console.log('Payment succeeded for invoice:', invoice.id);
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  // Handle failed payment logic
  console.log('Payment failed for invoice:', invoice.id);
}
