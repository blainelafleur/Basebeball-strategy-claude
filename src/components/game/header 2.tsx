'use client';

import { Trophy, Flame, Star, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

export function GameHeader() {
  const { playerStats } = useGameStore();

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

          {/* Stats */}
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </header>
  );
}
