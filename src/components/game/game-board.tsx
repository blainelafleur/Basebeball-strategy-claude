'use client';

import { useGameStore } from '@/lib/store';
import { PositionSelector } from './position-selector';
import { ScenarioDisplay } from './scenario-display';
import { OutcomeDisplay } from './outcome-display';
import { BaseballField } from './baseball-field';
import { FeatureShowcase } from './feature-showcase';
import { useEffect } from 'react';

export function GameBoard() {
  const { selectedPosition, currentScenario, isPlaying, showOutcome, startNewScenario } =
    useGameStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys for quick choice selection
      if (e.key >= '1' && e.key <= '4' && isPlaying && currentScenario) {
        const choiceButtons = document.querySelectorAll('[data-choice-button]');
        const index = parseInt(e.key) - 1;
        if (choiceButtons[index]) {
          (choiceButtons[index] as HTMLButtonElement).click();
        }
      }

      // Enter or Space for next scenario
      if ((e.key === 'Enter' || e.key === ' ') && showOutcome) {
        e.preventDefault();
        startNewScenario();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentScenario, showOutcome, startNewScenario]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-8 space-y-8">
            {!selectedPosition && <PositionSelector />}
            {selectedPosition && isPlaying && !showOutcome && <ScenarioDisplay />}
            {showOutcome && <OutcomeDisplay />}
          </div>

          {/* Side Panel - Field and Analytics */}
          <div className="lg:col-span-4">
            <BaseballField />
          </div>
        </div>

        {/* Feature Showcase Section */}
        <div className="mt-16">
          <FeatureShowcase />
        </div>
      </div>
    </div>
  );
}
