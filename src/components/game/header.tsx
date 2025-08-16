'use client';

import {
  Trophy,
  Flame,
  Star,
  TrendingUp,
  User,
  LogOut,
  Settings,
  Crown,
  Users,
  Award,
  BarChart3,
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSession, signOut } from 'next-auth/react';
import { useRole } from '@/hooks/use-role';
import Link from 'next/link';

export function GameHeader() {
  const { playerStats } = useGameStore();
  const { data: session, status } = useSession();
  const { getRoleDisplayName, getRoleColor, isAdmin, isPro } = useRole();

  const stats = [
    {
      icon: Trophy,
      value: playerStats.points,
      label: 'Points',
      color: 'text-blue-400',
    },
    {
      icon: Flame,
      value: playerStats.streak,
      label: 'Streak',
      color: 'text-orange-400',
    },
    {
      icon: Star,
      value: playerStats.level,
      label: '',
      color: 'text-yellow-400',
    },
    {
      icon: TrendingUp,
      value: `${Math.round(playerStats.successRate)}%`,
      label: 'Success',
      color: 'text-green-400',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚾</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Baseball Strategy Master
            </h1>
          </div>

          {/* Stats and Auth */}
          <div className="flex items-center space-x-4">
            {/* Game Stats */}
            {stats.map((stat, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center space-x-2 px-3 py-2 bg-muted/50 backdrop-blur"
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                {stat.label && <span className="text-xs text-muted-foreground">{stat.label}</span>}
              </Badge>
            ))}

            {/* Authentication */}
            {status === 'loading' ? (
              <Badge variant="outline">Loading...</Badge>
            ) : session ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Badge
                    variant="outline"
                    className="flex items-center space-x-2 cursor-pointer hover:bg-muted"
                  >
                    <User className="h-3 w-3" />
                    <span>{session.user?.name || session.user?.email}</span>
                  </Badge>
                </Link>
                <Badge variant="secondary" className={`${getRoleColor()}`}>
                  {getRoleDisplayName()}
                </Badge>
                {isAdmin() && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}
                {isPro() && (
                  <>
                    <Link href="/analytics">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </Link>
                    <Link href="/achievements">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                      >
                        <Award className="h-3 w-3 mr-1" />
                        Achievements
                      </Button>
                    </Link>
                    <Link href="/social">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Friends
                      </Button>
                    </Link>
                    <Link href="/leaderboard">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                      >
                        <Trophy className="h-3 w-3 mr-1" />
                        Leaderboard
                      </Button>
                    </Link>
                    <Link href="/multiplayer">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Multiplayer
                      </Button>
                    </Link>
                  </>
                )}
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-3 w-3" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
