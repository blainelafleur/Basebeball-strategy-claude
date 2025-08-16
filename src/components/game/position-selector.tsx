'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/store';
import { scenarios } from '@/lib/scenarios';
import { motion } from 'framer-motion';

const positions = [
  {
    id: 'pitcher',
    name: 'Pitcher',
    icon: '⚾',
    description: 'Control the game from the mound',
  },
  {
    id: 'batter',
    name: 'Batter',
    icon: '🏏',
    description: 'Drive in runs at the plate',
  },
  {
    id: 'fielder',
    name: 'Fielder',
    icon: '🥎',
    description: 'Make defensive plays',
  },
  {
    id: 'baserunner',
    name: 'Runner',
    icon: '🏃',
    description: 'Advance around the bases',
  },
];

export function PositionSelector() {
  const { selectedPosition, selectPosition, setCurrentScenario } = useGameStore();

  const handlePositionSelect = (positionId: string) => {
    selectPosition(positionId);

    // Load scenario after a short delay for smooth UX
    setTimeout(() => {
      const scenario = scenarios[positionId];
      if (scenario) {
        setCurrentScenario(scenario);
      }
    }, 500);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Choose Your Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {positions.map((position, index) => (
            <motion.div
              key={position.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={selectedPosition === position.id ? 'default' : 'outline'}
                className={`w-full h-24 flex-col space-y-2 transition-all duration-300 ${
                  selectedPosition === position.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                    : 'hover:bg-muted hover:scale-105'
                }`}
                onClick={() => handlePositionSelect(position.id)}
              >
                <span className="text-3xl">{position.icon}</span>
                <div className="text-center">
                  <div className="font-semibold">{position.name}</div>
                  <div className="text-xs opacity-80">{position.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
