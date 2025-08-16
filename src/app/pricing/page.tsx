'use client';

import { useState } from 'react';
import { Check, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import { useRole } from '@/hooks/use-role';
import { PRICE_IDS } from '@/lib/stripe';
import Link from 'next/link';
import { toast } from 'sonner';

export default function PricingPage() {
  const { data: session } = useSession();
  const { role } = useRole();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planName: string, priceId: string) => {
    if (!session) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoadingPlan(planName);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan: planName.toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start subscription');
    } finally {
      setLoadingPlan(null);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with baseball strategy',
      features: [
        '25 basic scenarios',
        'Local score tracking',
        'Basic field positions',
        'Community support',
      ],
      limitations: ['Limited scenario variety', 'No detailed analytics', 'No multiplayer features'],
      role: 'FREE',
      current: role === 'FREE',
      popular: false,
      priceId: null,
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: 'month',
      description: 'Advanced features for serious players and coaches',
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
      role: 'PRO',
      current: role === 'PRO',
      popular: true,
      priceId: PRICE_IDS.PRO_MONTHLY,
    },
    {
      name: 'Team',
      price: '$29.99',
      period: 'month',
      description: 'Designed for coaches and teams',
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
      role: 'TEAM',
      current: role === 'TEAM',
      popular: false,
      priceId: PRICE_IDS.TEAM_MONTHLY,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock your baseball strategy potential with our comprehensive training plans
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''
              } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-4 right-4">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500">Limitations:</h4>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="h-4 w-4 text-gray-400 flex-shrink-0">×</span>
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-6">
                  {plan.current ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : plan.name === 'Free' ? (
                    session ? (
                      <Button disabled className="w-full">
                        Current Plan
                      </Button>
                    ) : (
                      <Link href="/auth/signin">
                        <Button className="w-full">Get Started</Button>
                      </Link>
                    )
                  ) : session ? (
                    <Button
                      className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                      disabled={loadingPlan === plan.name}
                      onClick={() => plan.priceId && handleSubscribe(plan.name, plan.priceId)}
                    >
                      {loadingPlan === plan.name ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {loadingPlan === plan.name ? 'Processing...' : 'Subscribe'}
                    </Button>
                  ) : (
                    <Link href="/auth/signin">
                      <Button
                        className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Need help choosing? Contact our team for personalized recommendations.
          </p>
          <Button variant="outline">Contact Sales</Button>
        </div>
      </div>
    </div>
  );
}
