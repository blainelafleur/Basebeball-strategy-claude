'use client';

import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/game/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Users,
  Zap,
  Target,
  Clock,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  level: string;
  gamesPlayed: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: number;
  avgResponseTime: number;
  rank: number;
}

interface LeaderboardData {
  overall: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  streaks: LeaderboardEntry[];
  accuracy: LeaderboardEntry[];
  speed: LeaderboardEntry[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('overall');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const leaderboardData = await response.json();
      setData(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <GameHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const renderLeaderboard = (
    entries: LeaderboardEntry[],
    showAccuracy = false,
    showSpeed = false
  ) => (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card
          key={entry.id}
          className={`transition-all duration-200 hover:shadow-lg ${getRankBackground(entry.rank)}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{entry.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      Level {entry.level}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{entry.gamesPlayed} games</span>
                    </div>

                    {showAccuracy && (
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3" />
                        <span>{entry.accuracy}% accuracy</span>
                      </div>
                    )}

                    {showSpeed && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{entry.avgResponseTime}s avg</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>{entry.currentStreak} streak</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedPeriod === 'streaks'
                    ? entry.bestStreak
                    : selectedPeriod === 'accuracy'
                      ? `${entry.accuracy}%`
                      : selectedPeriod === 'speed'
                        ? `${entry.avgResponseTime}s`
                        : entry.points.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedPeriod === 'streaks'
                    ? 'best streak'
                    : selectedPeriod === 'accuracy'
                      ? 'accuracy'
                      : selectedPeriod === 'speed'
                        ? 'avg time'
                        : 'points'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {entries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
            <p className="text-gray-600">Be the first to climb the leaderboard!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <GameHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Leaderboards</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            See how you stack up against other baseball strategy masters. Compete for the top spots
            in points, accuracy, streaks, and speed.
          </p>
        </div>

        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overall" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Overall</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Weekly</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Monthly</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Streaks</span>
            </TabsTrigger>
            <TabsTrigger value="accuracy" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Accuracy</span>
            </TabsTrigger>
            <TabsTrigger value="speed" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Speed</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overall">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Overall Points Leaders</span>
                  </CardTitle>
                  <CardDescription>Top players by total points earned</CardDescription>
                </CardHeader>
                <CardContent>
                  {data ? renderLeaderboard(data.overall) : <div>Loading...</div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>This Week&apos;s Champions</span>
                  </CardTitle>
                  <CardDescription>Top performers this week</CardDescription>
                </CardHeader>
                <CardContent>
                  {data ? renderLeaderboard(data.weekly) : <div>Loading...</div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Monthly Leaders</span>
                  </CardTitle>
                  <CardDescription>Top players this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {data ? renderLeaderboard(data.monthly) : <div>Loading...</div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="streaks">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Streak Masters</span>
                  </CardTitle>
                  <CardDescription>Players with the longest winning streaks</CardDescription>
                </CardHeader>
                <CardContent>
                  {data ? renderLeaderboard(data.streaks) : <div>Loading...</div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="accuracy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Accuracy Champions</span>
                  </CardTitle>
                  <CardDescription>Most accurate decision makers (min 20 games)</CardDescription>
                </CardHeader>
                <CardContent>
                  {data ? renderLeaderboard(data.accuracy, true) : <div>Loading...</div>}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="speed">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Speed Demons</span>
                  </CardTitle>
                  <CardDescription>Fastest decision makers (min 20 games)</CardDescription>
                </CardHeader>
                <CardContent>
                  {data ? renderLeaderboard(data.speed, false, true) : <div>Loading...</div>}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button onClick={fetchLeaderboard} disabled={loading}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Rankings
          </Button>
        </div>
      </div>
    </div>
  );
}
