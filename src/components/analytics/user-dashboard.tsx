'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Trophy,
  Zap,
  ChevronUp,
  ChevronDown,
  Award,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserAnalytics {
  overview: {
    totalGames: number;
    overallAccuracy: number;
    totalPoints: number;
    currentLevel: string;
    currentStreak: number;
    bestStreak: number;
    avgResponseTime: number;
    fastestResponse: number;
  };
  categoryStats: Array<{
    category: string;
    total: number;
    correct: number;
    accuracy: number;
    avgResponseTime: number;
    totalPoints: number;
  }>;
  difficultyStats: Array<{
    difficulty: string;
    total: number;
    correct: number;
    accuracy: number;
    avgResponseTime: number;
    totalPoints: number;
  }>;
  performanceTrend: Array<{
    date: string;
    games: number;
    accuracy: number;
    avgResponseTime: number;
    points: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    icon: string;
    points: number;
    unlockedAt: string;
  }>;
  insights: {
    strengths: Array<{
      category: string;
      accuracy: number;
      games: number;
    }>;
    weaknesses: Array<{
      category: string;
      accuracy: number;
      games: number;
    }>;
  };
}

export function UserAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/user');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
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
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-gray-600">Start playing scenarios to see your analytics!</p>
        </CardContent>
      </Card>
    );
  }

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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pitcher':
        return '⚾';
      case 'batter':
        return '🏏';
      case 'fielder':
        return '🥎';
      case 'baserunner':
        return '🏃';
      default:
        return '📊';
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{analytics.overview.totalGames}</p>
              </div>
              <Trophy className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                <p className="text-2xl font-bold">{analytics.overview.overallAccuracy}%</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{analytics.overview.currentStreak}</p>
                <p className="text-xs text-muted-foreground">
                  Best: {analytics.overview.bestStreak}
                </p>
              </div>
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{analytics.overview.avgResponseTime}s</p>
                <p className="text-xs text-muted-foreground">
                  Fastest: {analytics.overview.fastestResponse}s
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Performance by Position</span>
          </CardTitle>
          <CardDescription>
            Your accuracy and performance across different baseball positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryStats.map((category) => (
              <div
                key={category.category}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                  <div>
                    <h4 className="font-medium capitalize">{category.category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.total} games • {category.totalPoints} points
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold">{category.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">{category.avgResponseTime}s avg</p>
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(category.accuracy, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance by Difficulty */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Performance by Difficulty</span>
          </CardTitle>
          <CardDescription>How you perform across different difficulty levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.difficultyStats.map((difficulty) => (
              <div key={difficulty.difficulty} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getDifficultyColor(difficulty.difficulty)}>
                    {difficulty.difficulty}
                  </Badge>
                  <span className="text-2xl font-bold">{difficulty.accuracy}%</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Games Played:</span>
                    <span className="font-medium">{difficulty.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct Answers:</span>
                    <span className="font-medium">{difficulty.correct}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-medium">{difficulty.avgResponseTime}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Points Earned:</span>
                    <span className="font-medium">{difficulty.totalPoints}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-600">
              <ChevronUp className="w-5 h-5" />
              <span>Your Strengths</span>
            </CardTitle>
            <CardDescription>Areas where you excel</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.insights.strengths.length > 0 ? (
              <div className="space-y-3">
                {analytics.insights.strengths.map((strength, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getCategoryIcon(strength.category)}</span>
                      <div>
                        <p className="font-medium capitalize">{strength.category}</p>
                        <p className="text-xs text-muted-foreground">{strength.games} games</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {strength.accuracy}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Play more games to identify your strengths!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <ChevronDown className="w-5 h-5" />
              <span>Areas for Improvement</span>
            </CardTitle>
            <CardDescription>Focus areas to boost your performance</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.insights.weaknesses.length > 0 ? (
              <div className="space-y-3">
                {analytics.insights.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getCategoryIcon(weakness.category)}</span>
                      <div>
                        <p className="font-medium capitalize">{weakness.category}</p>
                        <p className="text-xs text-muted-foreground">{weakness.games} games</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {weakness.accuracy}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Great job! No major weaknesses identified.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Recent Achievements</span>
          </CardTitle>
          <CardDescription>Your latest unlocked achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.achievements.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {analytics.achievements.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        +{achievement.points} points
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Start playing to unlock achievements!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Recommended Actions</span>
          </CardTitle>
          <CardDescription>Suggestions to improve your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.insights.weaknesses.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    Practice {analytics.insights.weaknesses[0].category} scenarios
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Focus on your weakest area to improve overall performance
                  </p>
                </div>
                <Button size="sm">Practice Now</Button>
              </div>
            )}

            {analytics.overview.avgResponseTime > 10 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Work on decision speed</p>
                  <p className="text-sm text-muted-foreground">
                    Your average response time is {analytics.overview.avgResponseTime}s. Try to
                    decide faster!
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  View Tips
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Try higher difficulty scenarios</p>
                <p className="text-sm text-muted-foreground">
                  Challenge yourself with advanced scenarios to earn more points
                </p>
              </div>
              <Button size="sm" variant="outline">
                Explore
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
