'use client';

import {
  Trophy,
  Users,
  Award,
  BarChart3,
  Crown,
  Target,
  Brain,
  CreditCard,
  Lock,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRole } from '@/hooks/use-role';

interface NavItem {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  requiresPro?: boolean;
  requiresAdmin?: boolean;
}

const gameFeatures: NavItem[] = [
  {
    title: 'Game Scenarios',
    href: '/',
    description: 'Interactive baseball strategy scenarios',
    icon: Target,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    description: 'Advanced performance analytics',
    icon: BarChart3,
    requiresAuth: true,
    requiresPro: true,
  },
  {
    title: 'Achievements',
    href: '/achievements',
    description: 'Unlock badges and milestones',
    icon: Award,
    requiresAuth: true,
    requiresPro: true,
  },
  {
    title: 'AI Coaching',
    href: '/?ai-coach=true',
    description: 'Personalized coaching with XAI',
    icon: Brain,
    requiresAuth: true,
    requiresPro: true,
  },
];

const socialFeatures: NavItem[] = [
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    description: 'Compete with other players',
    icon: Trophy,
  },
  {
    title: 'Friends',
    href: '/social',
    description: 'Connect with other players',
    icon: Users,
    requiresAuth: true,
    requiresPro: true,
  },
  {
    title: 'Multiplayer',
    href: '/multiplayer',
    description: 'Real-time multiplayer challenges',
    icon: Users,
    requiresAuth: true,
    requiresPro: true,
  },
];

const adminFeatures: NavItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin',
    description: 'Manage scenarios and users',
    icon: Crown,
    requiresAuth: true,
    requiresAdmin: true,
  },
];

export function MainNav() {
  const { data: session } = useSession();
  const { isAdmin, isPro } = useRole();

  const canAccess = (item: NavItem) => {
    if (item.requiresAdmin && !isAdmin()) return false;
    if (item.requiresPro && !isPro()) return false;
    if (item.requiresAuth && !session) return false;
    return true;
  };

  const getAccessIndicator = (item: NavItem) => {
    if (!item.requiresAuth && !item.requiresPro && !item.requiresAdmin) {
      return (
        <Badge variant="secondary" className="text-xs">
          Free
        </Badge>
      );
    }
    if (item.requiresAdmin) {
      return (
        <Badge variant="destructive" className="text-xs">
          Admin
        </Badge>
      );
    }
    if (item.requiresPro) {
      return (
        <Badge variant="default" className="text-xs">
          Pro
        </Badge>
      );
    }
    if (item.requiresAuth) {
      return (
        <Badge variant="outline" className="text-xs">
          Sign In
        </Badge>
      );
    }
    return null;
  };

  const renderNavItems = (items: NavItem[]) =>
    items.map((item) => {
      const canUserAccess = canAccess(item);
      const ItemComponent = canUserAccess ? Link : 'div';

      return (
        <DropdownMenuItem key={item.href} asChild={canUserAccess}>
          <ItemComponent
            href={canUserAccess ? item.href : '#'}
            className={`flex items-center space-x-3 p-3 ${
              !canUserAccess ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.title}</span>
                <div className="flex items-center space-x-1">
                  {!canUserAccess && <Lock className="h-3 w-3" />}
                  {getAccessIndicator(item)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </ItemComponent>
        </DropdownMenuItem>
      );
    });

  return (
    <nav className="hidden md:flex items-center space-x-4">
      {/* Game Features Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1">
            <Target className="h-4 w-4" />
            <span>Game</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start">
          <DropdownMenuLabel>Game Features</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {renderNavItems(gameFeatures)}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Social Features Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Social</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start">
          <DropdownMenuLabel>Social Features</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {renderNavItems(socialFeatures)}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Pricing Link */}
      <Link href="/pricing">
        <Button variant="ghost" className="flex items-center space-x-1">
          <CreditCard className="h-4 w-4" />
          <span>Pricing</span>
        </Button>
      </Link>

      {/* Admin Features (if admin) */}
      {isAdmin() && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1">
              <Crown className="h-4 w-4" />
              <span>Admin</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="start">
            <DropdownMenuLabel>Admin Features</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {renderNavItems(adminFeatures)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}

// Mobile Navigation
export function MobileNav() {
  const { data: session } = useSession();
  const { isAdmin, isPro } = useRole();

  const allFeatures = [...gameFeatures, ...socialFeatures, ...(isAdmin() ? adminFeatures : [])];

  const canAccess = (item: NavItem) => {
    if (item.requiresAdmin && !isAdmin()) return false;
    if (item.requiresPro && !isPro()) return false;
    if (item.requiresAuth && !session) return false;
    return true;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>All Features</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allFeatures.map((item) => {
          const canUserAccess = canAccess(item);
          const ItemComponent = canUserAccess ? Link : 'div';

          return (
            <DropdownMenuItem key={item.href} asChild={canUserAccess}>
              <ItemComponent
                href={canUserAccess ? item.href : '#'}
                className={`flex items-center space-x-2 ${
                  !canUserAccess ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {!canUserAccess && <Lock className="h-3 w-3 ml-auto" />}
              </ItemComponent>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/pricing" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Pricing</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
