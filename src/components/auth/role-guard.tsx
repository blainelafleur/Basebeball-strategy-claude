'use client';

import { useRole, UserRole } from '@/hooks/use-role';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Users, Zap } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: UserRole | UserRole[];
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function RoleGuard({
  children,
  requiredRole,
  fallback,
  showUpgrade = true,
}: RoleGuardProps) {
  const { hasRole } = useRole();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (!session) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to access this feature</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showUpgrade) {
      return null;
    }

    const roleNames = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const highestRole = roleNames.includes('ADMIN')
      ? 'ADMIN'
      : roleNames.includes('TEAM')
        ? 'TEAM'
        : roleNames.includes('PRO')
          ? 'PRO'
          : 'FREE';

    const upgradeInfo = {
      PRO: {
        icon: Zap,
        title: 'Pro Features',
        description:
          'Upgrade to Pro to access advanced scenarios, detailed analytics, and personalized coaching.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      },
      TEAM: {
        icon: Users,
        title: 'Team Features',
        description:
          'Upgrade to Team plan for multiplayer features, team management, and collaborative tools.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      ADMIN: {
        icon: Crown,
        title: 'Admin Access',
        description: 'This feature is restricted to administrators only.',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      },
    };

    const info = upgradeInfo[highestRole as keyof typeof upgradeInfo];
    const IconComponent = info.icon;

    return (
      <Card className={`max-w-md mx-auto ${info.bgColor} ${info.borderColor}`}>
        <CardHeader className="text-center">
          <IconComponent className={`w-8 h-8 mx-auto mb-2 ${info.color}`} />
          <CardTitle className={info.color}>{info.title}</CardTitle>
          <CardDescription>{info.description}</CardDescription>
        </CardHeader>
        {highestRole !== 'ADMIN' && (
          <CardContent className="text-center">
            <Link href="/pricing">
              <Button
                className={`${info.color.replace('text-', 'bg-').replace('-600', '-500')} hover:${info.color.replace('text-', 'bg-').replace('-600', '-600')}`}
              >
                Upgrade Now
              </Button>
            </Link>
          </CardContent>
        )}
      </Card>
    );
  }

  return <>{children}</>;
}
