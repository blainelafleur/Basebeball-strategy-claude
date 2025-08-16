'use client';

import { UserAnalyticsDashboard } from '@/components/analytics/user-dashboard';
import { AdminAnalyticsDashboard } from '@/components/analytics/admin-dashboard';
import { GameHeader } from '@/components/game/header';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Target, Award, Crown, Shield } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <GameHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Performance Analytics</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Track your progress, identify strengths and weaknesses, and get personalized insights to
            improve your baseball strategy skills.
          </p>
        </div>

        <RoleGuard
          requiredRole={['PRO', 'TEAM', 'ADMIN']}
          fallback={
            <Card className="max-w-4xl mx-auto border-dashed border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-8 text-center">
                <Crown className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-semibold mb-2">Advanced Analytics - Pro Feature</h3>
                <p className="text-gray-600 mb-6">
                  Get detailed insights into your performance with comprehensive analytics and
                  personalized recommendations
                </p>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-medium">Performance Tracking</h4>
                    <p className="text-sm text-gray-500">
                      Detailed stats by position and difficulty
                    </p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <h4 className="font-medium">Progress Trends</h4>
                    <p className="text-sm text-gray-500">See your improvement over time</p>
                  </div>
                  <div className="text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <h4 className="font-medium">Strengths & Weaknesses</h4>
                    <p className="text-sm text-gray-500">Identify areas for improvement</p>
                  </div>
                  <div className="text-center">
                    <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <h4 className="font-medium">Achievement Tracking</h4>
                    <p className="text-sm text-gray-500">Monitor your accomplishments</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-blue-200 mb-6">
                  <h4 className="font-semibold mb-3">Free Plan Analytics Preview</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="font-medium">Games Played</p>
                      <p className="text-2xl font-bold text-blue-600">0</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="font-medium">Overall Accuracy</p>
                      <p className="text-2xl font-bold text-green-600">--%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="font-medium">Current Streak</p>
                      <p className="text-2xl font-bold text-orange-600">0</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Upgrade to Pro to unlock detailed analytics, performance trends, and
                    personalized insights
                  </p>
                </div>

                <Button className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-3">
                  Upgrade to Pro - $9.99/month
                </Button>

                <p className="text-sm text-gray-500 mt-4">
                  30-day money-back guarantee • Cancel anytime
                </p>
              </CardContent>
            </Card>
          }
          showUpgrade={false}
        >
          <RoleGuard
            requiredRole={['ADMIN']}
            fallback={<UserAnalyticsDashboard />}
            showUpgrade={false}
          >
            <Tabs defaultValue="user" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>My Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Platform Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user" className="mt-6">
                <UserAnalyticsDashboard />
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
                <AdminAnalyticsDashboard />
              </TabsContent>
            </Tabs>
          </RoleGuard>
        </RoleGuard>
      </div>
    </div>
  );
}
