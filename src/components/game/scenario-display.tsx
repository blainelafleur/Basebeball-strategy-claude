'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function ScenarioDisplay() {
  const { currentScenario, isPlaying, makeDecision } = useGameStore();
  const [choicesVisible, setChoicesVisible] = useState(false);

  useEffect(() => {
    if (currentScenario && isPlaying) {
      // Show choices after a brief delay for better UX
      const timer = setTimeout(() => {
        setChoicesVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setChoicesVisible(false);
    }
  }, [currentScenario, isPlaying]);

  if (!currentScenario || !isPlaying) {
    return null;
  }

  const handleDecision = (decision: string) => {
    setChoicesVisible(false);
    makeDecision(decision);
  };

  const situation = currentScenario.situation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Scenario Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-400">{currentScenario.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">{currentScenario.description}</p>

          {/* Game Situation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Inning
              </div>
              <div className="text-lg font-bold text-blue-400">{situation.inning}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Score
              </div>
              <div className="text-lg font-bold text-blue-400">{situation.score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Count
              </div>
              <div className="text-lg font-bold text-blue-400">{situation.count}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Runners
              </div>
              <div className="text-lg font-bold text-blue-400">{situation.runners}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Choices */}
      {choicesVisible ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {currentScenario.options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Button
                variant="outline"
                className="w-full text-left p-6 h-auto hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300"
                onClick={() => handleDecision(option)}
                data-choice-button
              >
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{option}</span>
                </div>
              </Button>
            </motion.div>
          ))}

          {/* Keyboard hint */}
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              💡 Use keyboard shortcuts: Press 1-4 to select choices quickly
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.16,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
