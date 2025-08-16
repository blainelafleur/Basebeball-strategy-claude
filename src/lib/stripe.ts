import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  TEAM_MONTHLY: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || 'price_team_monthly',
} as const;

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      '25 basic scenarios',
      'Local score tracking',
      'Basic field positions',
      'Community support',
    ],
    limitations: ['Limited scenario variety', 'No detailed analytics', 'No multiplayer features'],
  },
  PRO: {
    name: 'Pro',
    price: 999, // $9.99 in cents
    priceId: PRICE_IDS.PRO_MONTHLY,
    features: [
      '500+ professional scenarios',
      'Advanced analytics & insights',
      'AI-powered coaching tips',
      'Video explanations',
      'MLB example integration',
      'Performance tracking',
      'Achievement system',
      'Priority support',
    ],
    limitations: [],
  },
  TEAM: {
    name: 'Team',
    price: 2999, // $29.99 in cents
    priceId: PRICE_IDS.TEAM_MONTHLY,
    features: [
      'Everything in Pro',
      'Team management tools',
      'Multiplayer challenges',
      'Team analytics dashboard',
      'Custom scenario creation',
      'Player progress tracking',
      'Team leaderboards',
      'Dedicated support',
    ],
    limitations: [],
  },
} as const;

export type PlanType = keyof typeof PLANS;
