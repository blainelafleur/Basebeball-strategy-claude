'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleGuard } from '@/components/auth/role-guard';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  MessageCircle,
  Loader2,
  Crown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CoachingRequest, CoachingResponse } from '@/lib/openai';

interface AICoachProps {
  scenario: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    inning: string;
    score: string;
    count?: string;
    runners: string;
    outs?: number;
  };
  userChoice: string;
  isCorrect: boolean;
  explanation: string;
  onCoachingReceived?: (coaching: CoachingResponse) => void;
}

export function AICoach({
  scenario,
  userChoice,
  isCorrect,
  explanation,
  onCoachingReceived,
}: AICoachProps) {
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCoaching = async () => {
    setIsLoading(true);

    try {
      const coachingRequest: CoachingRequest = {
        scenario,
        userChoice,
        isCorrect,
        explanation,
        userPerformance: {
          recentAccuracy: 75, // This would come from user stats in a real app
          weakAreas: ['pressure situations', 'baserunning'],
          strengths: ['batting decisions', 'defensive positioning'],
        },
      };

      const response = await fetch('/api/ai/coaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coachingRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          toast.error(data.message || 'AI coaching is a Pro feature');
          return;
        }
        throw new Error(data.error || 'Failed to get coaching');
      }

      setCoaching(data);
      onCoachingReceived?.(data);
      toast.success('AI coaching feedback received!');
    } catch (error) {
      console.error('Error getting coaching:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get AI coaching');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard
      requiredRole={['PRO', 'TEAM', 'ADMIN']}
      fallback={
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Crown className="w-8 h-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold mb-2">AI Coach - Pro Feature</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get personalized coaching feedback and tips from our AI baseball coach
            </p>
            <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600">
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      }
      showUpgrade={false}
    >
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-purple-800">AI Baseball Coach</CardTitle>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Sparkles className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            </div>
            {!coaching && (
              <Button
                onClick={getCoaching}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4 mr-2" />
                )}
                Get Coaching
              </Button>
            )}
          </div>
          <CardDescription>
            Receive personalized feedback and improvement tips from our AI coach
          </CardDescription>
        </CardHeader>

        {coaching && (
          <CardContent className="space-y-6">
            {/* Feedback Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-purple-800">Coach&apos;s Feedback</h4>
              </div>
              <p className="text-gray-700 bg-white p-4 rounded-lg border border-purple-100">
                {coaching.feedback}
              </p>
            </div>

            {/* Tips Section */}
            {coaching.tips && coaching.tips.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-semibold text-purple-800">Improvement Tips</h4>
                </div>
                <ul className="space-y-2">
                  {coaching.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 bg-white p-3 rounded-lg border border-purple-100"
                    >
                      <Target className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps Section */}
            {coaching.nextSteps && coaching.nextSteps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-purple-800">Next Steps</h4>
                </div>
                <ul className="space-y-2">
                  {coaching.nextSteps.map((step, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 bg-white p-3 rounded-lg border border-purple-100"
                    >
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Encouragement Section */}
            {coaching.encouragement && (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-green-800">Motivation</h4>
                </div>
                <p className="text-green-700 font-medium">{coaching.encouragement}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4 border-t border-purple-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCoaching(null)}
                className="flex-1"
              >
                Get New Feedback
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => toast.success('Feedback saved to your progress!')}
              >
                Save to Progress
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </RoleGuard>
  );
}
