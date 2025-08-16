'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  TrendingUp,
  Target,
  Crown,
  Trophy,
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminAnalytics {
  overview: {
    totalUsers: number;
    totalGames: number;
    totalScenarios: number;
    activeUsers: number;
    recentRegistrations: number;
    conversionRate: number;
  };
  userDistribution: Array<{
    role: string;
    count: number;
    percentage: number;
  }>;
  subscriptionStats: Array<{
    plan: string;
    count: number;
  }>;
  activityTrend: Array<{
    date: string;
    games: number;
  }>;
  scenarioPopularity: Array<{
    id: string;
    title: string;
    category: string;
    difficulty: string;
    timesPlayed: number;
    averageScore: number;
    recentGames: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    totalGames: number;
    avgPoints: number;
    avgResponseTime: number;
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    points: number;
    level: string;
    gamesPlayed: number;
    currentStreak: number;
    bestStreak: number;
  }>;
}

export function AdminAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/admin');
      if (!response.ok) {
        throw new Error('Failed to fetch admin analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching admin analytics:', error);
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-600">Unable to fetch admin analytics data.</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'FREE':
        return 'bg-gray-100 text-gray-700';
      case 'PRO':
        return 'bg-blue-100 text-blue-700';
      case 'TEAM':
        return 'bg-purple-100 text-purple-700';
      case 'ADMIN':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700';
      case 'advanced':
        return 'bg-orange-100 text-orange-700';
      case 'expert':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {analytics.overview.totalUsers.toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">
                  {analytics.overview.totalGames.toLocaleString()}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users (30d)</p>
                <p className="text-2xl font-bold">
                  {analytics.overview.activeUsers.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analytics.overview.conversionRate.toFixed(1)}% conversion
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Users (30d)</p>
                <p className="text-2xl font-bold">
                  {analytics.overview.recentRegistrations.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>User Distribution by Role</span>
          </CardTitle>
          <CardDescription>Breakdown of users across subscription tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.userDistribution.map((role) => (
              <div key={role.role} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getRoleColor(role.role)}>{role.role}</Badge>
                  <span className="text-2xl font-bold">{role.count}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {role.percentage.toFixed(1)}% of total users
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${role.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Statistics */}
      {analytics.subscriptionStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Active Subscriptions</span>
            </CardTitle>
            <CardDescription>Current subscription breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {analytics.subscriptionStats.map((sub) => (
                <div
                  key={sub.plan}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg text-center"
                >
                  <h4 className="font-semibold text-lg capitalize">{sub.plan}</h4>
                  <p className="text-2xl font-bold text-green-600">{sub.count}</p>
                  <p className="text-sm text-muted-foreground">active subscriptions</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Daily Activity (Last 30 Days)</span>
          </CardTitle>
          <CardDescription>Games played per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.activityTrend.slice(-7).map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <span className="text-sm font-medium">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{day.games} games</span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((day.games / Math.max(...analytics.activityTrend.map((d) => d.games))) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Most Popular Scenarios</span>
          </CardTitle>
          <CardDescription>Top 10 most played scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.scenarioPopularity.map((scenario, index) => (
              <div
                key={scenario.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <div>
                    <h4 className="font-medium">{scenario.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {scenario.category}
                      </Badge>
                      <Badge className={getDifficultyColor(scenario.difficulty) + ' text-xs'}>
                        {scenario.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{scenario.timesPlayed} plays</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {scenario.averageScore?.toFixed(1) || 0} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Performance by Category</span>
          </CardTitle>
          <CardDescription>Platform-wide performance across baseball positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryPerformance.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium capitalize">{category.category}</h4>
                  <p className="text-sm text-muted-foreground">{category.totalGames} total games</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{category.avgPoints} avg points</p>
                  <p className="text-xs text-muted-foreground">
                    {category.avgResponseTime}s avg time
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>Top Performers</span>
          </CardTitle>
          <CardDescription>Highest scoring users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-lg font-bold ${index < 3 ? 'text-yellow-500' : 'text-muted-foreground'}`}
                  >
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        Level {user.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.gamesPlayed} games
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{user.points.toLocaleString()} pts</p>
                  <p className="text-xs text-muted-foreground">
                    {user.currentStreak} streak (best: {user.bestStreak})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
