'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Target, Clock, TrendingUp } from 'lucide-react';

export function OutcomeDisplay() {
  const { showOutcome, lastOutcome, startNewScenario } = useGameStore();

  if (!showOutcome || !lastOutcome) {
    return null;
  }

  const outcomeConfig = {
    success: {
      icon: lastOutcome.isOptimal ? Target : CheckCircle,
      title: lastOutcome.isOptimal ? 'Perfect Strategy!' : 'Good Choice!',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
      iconColor: 'text-green-400',
    },
    warning: {
      icon: AlertCircle,
      title: 'Decent Decision',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/50',
      iconColor: 'text-yellow-400',
    },
    danger: {
      icon: XCircle,
      title: 'Learning Opportunity',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
      iconColor: 'text-red-400',
    },
  };

  const config = outcomeConfig[lastOutcome.category];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
        <CardContent className="pt-6 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <IconComponent className={`h-8 w-8 ${config.iconColor}`} />
            <h3 className="text-2xl font-bold">{config.title}</h3>
          </div>

          {/* Explanation */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">{lastOutcome.explanation}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
                <div className="font-semibold">{lastOutcome.successRate}%</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-muted-foreground">Decision Time</div>
                <div className="font-semibold">{lastOutcome.decisionTime.toFixed(1)}s</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl">💎</span>
              <div>
                <div className="text-sm text-muted-foreground">Points Earned</div>
                <div className="font-semibold text-green-400">+{lastOutcome.points}</div>
              </div>
            </div>
          </div>

          {/* Key Learning */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">💡</span>
              <span className="font-semibold text-blue-400">Key Learning</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Understanding game situations and making strategic decisions under pressure is crucial
              for baseball success. Each choice has different risk-reward profiles.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={startNewScenario}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              size="lg"
            >
              Next Challenge
            </Button>

            <Button variant="outline" onClick={startNewScenario} size="lg" className="sm:w-auto">
              Different Position
            </Button>
          </div>

          {/* Keyboard Hint */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              💡 Press Enter or Space for next challenge
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
