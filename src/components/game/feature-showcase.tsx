'use client';

import {
  Trophy,
  Users,
  Award,
  BarChart3,
  Brain,
  Target,
  CreditCard,
  Lock,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRole } from '@/hooks/use-role';

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: 'game' | 'social' | 'premium' | 'analytics';
  requiresAuth?: boolean;
  requiresPro?: boolean;
  benefits: string[];
}

const features: Feature[] = [
  {
    title: 'Analytics Dashboard',
    description: 'Track your performance with detailed analytics and insights',
    icon: BarChart3,
    href: '/analytics',
    category: 'analytics',
    requiresAuth: true,
    requiresPro: true,
    benefits: ['Performance trends', 'Weakness analysis', 'Progress tracking', 'Advanced metrics'],
  },
  {
    title: 'Achievement System',
    description: 'Unlock badges and milestones as you improve your skills',
    icon: Award,
    href: '/achievements',
    category: 'game',
    requiresAuth: true,
    requiresPro: true,
    benefits: ['25+ achievements', 'Progress tracking', 'Skill milestones', 'Leaderboard points'],
  },
  {
    title: 'AI Coaching',
    description: 'Get personalized feedback and tips from XAI-powered coaching',
    icon: Brain,
    href: '/?ai-coach=true',
    category: 'premium',
    requiresAuth: true,
    requiresPro: true,
    benefits: [
      'Personalized feedback',
      'Strategic insights',
      'Improvement tips',
      'Real-time analysis',
    ],
  },
  {
    title: 'Leaderboards',
    description: 'Compete with players worldwide across multiple categories',
    icon: Trophy,
    href: '/leaderboard',
    category: 'social',
    benefits: ['Global rankings', 'Weekly challenges', 'Skill categories', 'Achievement showcases'],
  },
  {
    title: 'Social Features',
    description: 'Connect with friends and challenge other players',
    icon: Users,
    href: '/social',
    category: 'social',
    requiresAuth: true,
    requiresPro: true,
    benefits: ['Friend system', 'Private challenges', 'Team competitions', 'Social leaderboards'],
  },
  {
    title: 'Multiplayer Mode',
    description: 'Real-time multiplayer challenges and tournaments',
    icon: Users,
    href: '/multiplayer',
    category: 'social',
    requiresAuth: true,
    requiresPro: true,
    benefits: ['Real-time matches', 'Tournaments', 'Team battles', 'Live rankings'],
  },
];

export function FeatureShowcase() {
  const { data: session } = useSession();
  const { isPro } = useRole();

  const canAccess = (feature: Feature) => {
    if (feature.requiresPro && !isPro()) return false;
    if (feature.requiresAuth && !session) return false;
    return true;
  };

  const getAccessText = (feature: Feature) => {
    if (!feature.requiresAuth && !feature.requiresPro) return 'Free';
    if (feature.requiresPro) return isPro() ? 'Available' : 'Pro Feature';
    if (feature.requiresAuth) return session ? 'Available' : 'Sign In Required';
    return 'Available';
  };

  const getAccessColor = (feature: Feature) => {
    if (!feature.requiresAuth && !feature.requiresPro) return 'bg-green-100 text-green-800';
    if (feature.requiresPro && !isPro()) return 'bg-blue-100 text-blue-800';
    if (feature.requiresAuth && !session) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const categoryIcons = {
    game: Target,
    social: Users,
    premium: Star,
    analytics: TrendingUp,
  };

  const categoryColors = {
    game: 'border-blue-200 bg-blue-50',
    social: 'border-pink-200 bg-pink-50',
    premium: 'border-yellow-200 bg-yellow-50',
    analytics: 'border-purple-200 bg-purple-50',
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Discover All Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          From basic scenarios to advanced analytics and multiplayer challenges, explore everything
          Baseball Strategy Master has to offer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const canUserAccess = canAccess(feature);
          const CategoryIcon = categoryIcons[feature.category];

          return (
            <Card
              key={feature.title}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                categoryColors[feature.category]
              } ${!canUserAccess ? 'opacity-75' : ''}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <feature.icon className="h-6 w-6" />
                    <CategoryIcon className="h-4 w-4 opacity-60" />
                  </div>
                  <Badge variant="secondary" className={`text-xs ${getAccessColor(feature)}`}>
                    {getAccessText(feature)}
                    {!canUserAccess && <Lock className="h-3 w-3 ml-1" />}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-1">
                  {feature.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center">
                      <div className="h-1.5 w-1.5 bg-current rounded-full mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  {canUserAccess ? (
                    <Link href={feature.href}>
                      <Button className="w-full" variant="default">
                        Explore Feature
                      </Button>
                    </Link>
                  ) : feature.requiresPro ? (
                    <Link href="/pricing">
                      <Button className="w-full" variant="outline">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signin">
                      <Button className="w-full" variant="outline">
                        Sign In to Access
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Ready to Master Baseball Strategy?</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join thousands of players improving their baseball IQ with our comprehensive training
            platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session ? (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Pro Features
                  </Button>
                </Link>
              </>
            ) : !isPro() ? (
              <Link href="/pricing">
                <Button size="lg" className="w-full sm:w-auto">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            ) : (
              <Link href="/analytics">
                <Button size="lg" className="w-full sm:w-auto">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Your Analytics
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
