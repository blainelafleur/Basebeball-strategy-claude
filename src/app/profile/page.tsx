'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRole } from '@/hooks/use-role';
import { useGameStore } from '@/lib/store';
import { User, Trophy, Target, TrendingUp, Clock, Star, Mail, Calendar, Edit } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session } = useSession();
  const { getRoleDisplayName, getRoleColor } = useRole();
  const { playerStats } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      icon: Trophy,
      label: 'Total Points',
      value: playerStats.points.toLocaleString(),
      color: 'text-yellow-600',
    },
    {
      icon: Target,
      label: 'Games Played',
      value: playerStats.gamesPlayed,
      color: 'text-blue-600',
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${Math.round(playerStats.successRate)}%`,
      color: 'text-green-600',
    },
    {
      icon: Star,
      label: 'Current Level',
      value: playerStats.level,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Player Profile</h1>
          <p className="text-gray-600">Manage your account and track your progress</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <CardTitle>{session.user?.name || 'Anonymous Player'}</CardTitle>
                <CardDescription className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{session.user?.email}</span>
                </CardDescription>
                <Badge className={`mt-2 ${getRoleColor()}`}>{getRoleDisplayName()}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Member since November 2024</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last active: Today</span>
                  </div>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/pricing">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
                <Link href="/achievements">
                  <Button variant="outline" className="w-full justify-start">
                    <Trophy className="w-4 h-4 mr-2" />
                    View Achievements
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        defaultValue={session.user?.name || ''}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Favorite Position</Label>
                      <Input id="position" placeholder="e.g., Shortstop, Pitcher" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team">Favorite Team</Label>
                      <Input id="team" placeholder="e.g., New York Yankees" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level</Label>
                      <Input id="experience" placeholder="e.g., High School, College, Pro" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input id="bio" placeholder="Tell us about your baseball background..." />
                    </div>
                    <div className="md:col-span-2 flex space-x-2">
                      <Button className="flex-1">Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Favorite Position
                        </Label>
                        <p className="mt-1">Not specified</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Favorite Team</Label>
                        <p className="mt-1">Not specified</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Experience Level
                        </Label>
                        <p className="mt-1">Not specified</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Bio</Label>
                        <p className="mt-1 text-gray-600">
                          Add a bio to tell others about your baseball background.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest games and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed Championship Scenario</p>
                      <p className="text-xs text-gray-500">Scored 85 points • 2 hours ago</p>
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      +85
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Reached Level: All-Star</p>
                      <p className="text-xs text-gray-500">New level unlocked • 1 day ago</p>
                    </div>
                    <Star className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">5-Game Win Streak</p>
                      <p className="text-xs text-gray-500">Achievement unlocked • 2 days ago</p>
                    </div>
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
