'use client';

import { AchievementsPage } from '@/components/achievements/achievements-page';
import { GameHeader } from '@/components/game/header';
import { RoleGuard } from '@/components/auth/role-guard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Crown, Zap } from 'lucide-react';

export default function AchievementsPageRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <GameHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Achievements & Progress</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Track your accomplishments, unlock rewards, and level up your baseball strategy skills.
            Complete challenges to earn experience points and unlock special badges.
          </p>
        </div>

        <RoleGuard
          requiredRole={['PRO', 'TEAM', 'ADMIN']}
          fallback={
            <Card className="max-w-4xl mx-auto border-dashed border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-semibold mb-2">Achievement System - Pro Feature</h3>
                <p className="text-gray-600 mb-6">
                  Unlock the full achievement system with detailed progress tracking, badges, and
                  leveling
                </p>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                    <h4 className="font-medium">Achievement Badges</h4>
                    <p className="text-sm text-gray-500">Unlock 30+ unique achievements</p>
                  </div>
                  <div className="text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-medium">Experience Points</h4>
                    <p className="text-sm text-gray-500">Level up with every achievement</p>
                  </div>
                  <div className="text-center">
                    <Crown className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <h4 className="font-medium">Tier System</h4>
                    <p className="text-sm text-gray-500">Bronze, Silver, Gold, Diamond</p>
                  </div>
                  <div className="text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <h4 className="font-medium">Special Challenges</h4>
                    <p className="text-sm text-gray-500">Hidden achievements to discover</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-blue-200 mb-6">
                  <h4 className="font-semibold mb-3">Free Plan Preview</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Trophy className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <p className="font-medium">Basic Achievements</p>
                      <p className="text-gray-500">Limited selection</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Star className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <p className="font-medium">Simple Progress</p>
                      <p className="text-gray-500">Basic tracking only</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Crown className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <p className="font-medium">No Leveling</p>
                      <p className="text-gray-500">Upgrade to unlock</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Upgrade to Pro to unlock the complete achievement system with leveling and
                    badges
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
          <AchievementsPage />
        </RoleGuard>
      </div>
    </div>
  );
}
