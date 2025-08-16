'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown, Target, Zap, Clock, Lock, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievements';

interface UserAchievement {
  id: string;
  achievementId: string;
  unlockedAt: string;
  achievement: {
    id: string;
    name: string;
    description: string;
    type: string;
    category?: string;
    icon: string;
    points: number;
    tier: string;
    isHidden: boolean;
  };
}

interface AchievementsData {
  achievements: UserAchievement[];
  totalPoints: number;
  unlockedCount: number;
  levelInfo: {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
  };
}

export function AchievementsPage() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (!response.ok) {
        throw new Error('Failed to fetch achievements');
      }
      const achievementsData = await response.json();
      setData(achievementsData);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
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

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Achievements Data</h3>
          <p className="text-gray-600">Failed to load your achievements.</p>
          <Button onClick={fetchAchievements} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const unlockedAchievements = new Set(data.achievements.map((a) => a.achievementId));

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'diamond':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'GAMES_PLAYED':
        return <Target className="w-5 h-5" />;
      case 'STREAK':
        return <Zap className="w-5 h-5" />;
      case 'ACCURACY':
        return <Star className="w-5 h-5" />;
      case 'SPEED':
        return <Clock className="w-5 h-5" />;
      case 'POINTS':
        return <Crown className="w-5 h-5" />;
      case 'SPECIAL':
        return <Award className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? ACHIEVEMENT_DEFINITIONS
      : ACHIEVEMENT_DEFINITIONS.filter((a) => a.type === selectedCategory);

  const visibleAchievements = filteredAchievements.filter(
    (a) => !a.isHidden || unlockedAchievements.has(a.id)
  );

  const completionRate =
    (data.unlockedCount / ACHIEVEMENT_DEFINITIONS.filter((a) => !a.isHidden).length) * 100;

  return (
    <div className="space-y-8">
      {/* Level and Progress Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Level Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Level {data.levelInfo.level}</h3>
                  <p className="text-muted-foreground">
                    {data.levelInfo.currentXP} / {data.levelInfo.nextLevelXP} XP
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {data.totalPoints.toLocaleString()} Total XP
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(data.levelInfo.progress)}% to next level
                  </p>
                </div>
              </div>
              <Progress value={data.levelInfo.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Achievement Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">{data.unlockedCount}</div>
              <div className="text-sm text-muted-foreground">
                of {ACHIEVEMENT_DEFINITIONS.filter((a) => !a.isHidden).length} unlocked
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(completionRate)}% complete
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="GAMES_PLAYED">Games</TabsTrigger>
          <TabsTrigger value="STREAK">Streaks</TabsTrigger>
          <TabsTrigger value="ACCURACY">Accuracy</TabsTrigger>
          <TabsTrigger value="SPEED">Speed</TabsTrigger>
          <TabsTrigger value="POINTS">Points</TabsTrigger>
          <TabsTrigger value="SPECIAL">Special</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleAchievements.map((achievement) => {
              const isUnlocked = unlockedAchievements.has(achievement.id);
              const userAchievement = data.achievements.find(
                (a) => a.achievementId === achievement.id
              );

              return (
                <Card
                  key={achievement.id}
                  className={`relative transition-all duration-200 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-white to-yellow-50 border-yellow-200 shadow-lg'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          isUnlocked ? 'bg-yellow-100' : 'bg-gray-200'
                        }`}
                      >
                        {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-gray-400" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4
                            className={`font-semibold ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}
                          >
                            {achievement.name}
                          </h4>
                          {isUnlocked && <Trophy className="w-4 h-4 text-yellow-500" />}
                        </div>

                        <p
                          className={`text-sm mb-3 ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}
                        >
                          {achievement.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getTierColor(achievement.tier)}>
                              {achievement.tier}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getCategoryIcon(achievement.type)}
                            </div>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-semibold ${isUnlocked ? 'text-yellow-600' : 'text-gray-400'}`}
                            >
                              +{achievement.points} XP
                            </div>
                            {userAchievement && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isUnlocked && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {visibleAchievements.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Achievements Found</h3>
                <p className="text-gray-600">No achievements found in this category.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
